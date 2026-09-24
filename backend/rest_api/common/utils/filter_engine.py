import logging
from dataclasses import dataclass, field
from datetime import timedelta
from typing import Any

from django.db import models
from django.db.models import Q
from django.utils import timezone
from rest_api.common.constants import META_PARAMS, TIME_RANGE_PARAMS
from rest_framework.exceptions import ValidationError

_logger = logging.getLogger(__name__)


@dataclass
class FilterResult:
    q_object: Q
    applied_params: dict = field(default_factory=dict)
    ignored_params: dict = field(default_factory=dict)


class QueryFilterEngine:
    """
    Core engine for applying column filters, index detection,
    and mandatory time boundaries across single models or UNION querysets.
    """

    LOOKUP_MAP = {
        "gt": "gt",
        "gte": "gte",
        "lt": "lt",
        "lte": "lte",
    }

    @classmethod
    def build_q_filters(
        cls, model: type[models.Model], request_params: dict, time_field: str = "statechangetime", default_hours: int = 12, force_time_filter: bool = False
    ) -> FilterResult:
        """
        Translates request parameters into a Django Q object.
        Enforces time boundaries if no indexed parameters are supplied.
        """
        params = request_params.copy()
        applied = {}
        ignored = {}

        # initial validation
        # must have an indexed parameter OR a time filter
        indexed_fields = cls._get_indexed_fields(model)
        has_indexed_search = any(k in indexed_fields for k in params.keys())
        has_time_param = any(k in params for k in TIME_RANGE_PARAMS)
        if not has_indexed_search and not has_time_param:
            _logger.debug("No indexed or time-based time boundaries provided, forcing default time filter.")
            force_time_filter = True

        # must have only supported filters
        cls._validate_query_params(model, params)

        # append time Q if required (or forced, e.g. for archived tables)
        q_object = Q()
        if force_time_filter or has_time_param:
            q_time, applied_time = cls._build_time_q(params, time_field, default_hours)
            applied.update(applied_time)
            q_object &= q_time
        else:
            q_time = Q()

        # apply model field filters
        q_model, applied_model, ignored_model = cls._build_model_fields_q(model, params)
        applied.update(applied_model)
        ignored.update(ignored_model)

        # apply custom object-based filters
        q_custom, applied_custom, ignored_custom = cls._get_custom_filters(model, params)
        applied.update(applied_custom)
        ignored.update(ignored_custom)

        # combine all Q objects
        final_q = q_time | q_model | q_custom

        return FilterResult(final_q, applied_params=applied, ignored_params=ignored)

    @classmethod
    def _build_model_fields_q(cls, model: type[models.Model], request_params: dict) -> tuple[Q, dict, dict]:
        """
        Parses request parameters against the model and transforms them into Q objects.
        Supports:
          - Comparisons: field_gt, field_gte, field_lt, field_lte
          - Wildcards: 'val*' -> icontains/istartswith, '*val' -> iendswith, '*val*' -> icontains
          - Lists (OR/IN): 'val1,val2' -> IN query
        """
        q = Q()
        applied = {}
        ignored = {}
        params = request_params.copy()
        model_fields = cls._get_all_fields(model)

        for param, raw_value in list(params.items()):
            if raw_value is None or raw_value == "":
                continue

            # parse suffixes (e.g., priority_gte -> field: priority, operation: gte)
            field_name = param
            lookup = None
            if "_" in param:
                parts = param.rsplit("_", 1)
                if parts[1] in cls.LOOKUP_MAP and parts[0] in model_fields:
                    field_name = parts[0]
                    lookup = cls.LOOKUP_MAP[parts[1]]

            # skip if field is not on the model
            if field_name not in model_fields:
                continue

            # remove consumed parameter from params dict
            val_str = str(params.pop(param)).strip()

            # comparison (_gt, _gte, _lt, _lte)
            if lookup:
                q &= Q(**{f"{field_name}__{lookup}": val_str})
                applied[param] = val_str
                continue

            # comma-separated values -> IN (...)
            if "," in val_str:
                values_list = [v.strip() for v in val_str.split(",") if v.strip()]
                if values_list:
                    q &= Q(**{f"{field_name}__in": values_list})
                    applied[param] = values_list
                continue

            # wildcards using '*' -> LIKE queries
            if "*" in val_str:
                if val_str.startswith("*") and val_str.endswith("*") and len(val_str) > 2:
                    clean_val = val_str[1:-1]
                    q &= Q(**{f"{field_name}__icontains": clean_val})
                elif val_str.startswith("*") and len(val_str) > 1:
                    clean_val = val_str[1:]
                    q &= Q(**{f"{field_name}__iendswith": clean_val})
                elif val_str.endswith("*") and len(val_str) > 1:
                    clean_val = val_str[:-1]
                    q &= Q(**{f"{field_name}__istartswith": clean_val})
                else:
                    # single '*' fallback -> match non-null / non-empty
                    q &= Q(**{f"{field_name}__isnull": False})
                applied[param] = val_str
                continue

            # exact match
            q &= Q(**{field_name: val_str})
            applied[param] = val_str

        return q, applied, ignored

    @classmethod
    def _build_time_q(cls, params: dict, time_field: str, default_hours: int) -> tuple[Q, dict]:
        """
        Build a Q object using custom time-range filters
        Args:
            params: request params
            time_field: str - name of the time field to filter by
            default_hours: int - default hours to fallback to

        Returns:

        """
        now = timezone.now()
        applied = {}

        if "hours" in params:
            val = int(params["hours"])
            applied["hours"] = val
            return Q(**{f"{time_field}__gte": now - timedelta(hours=val)}), applied
        elif "days" in params:
            val = int(params["days"])
            applied["days"] = val
            return Q(**{f"{time_field}__gte": now - timedelta(days=val)}), applied
        elif "date_from" in params:
            applied["date_from"] = params["date_from"]
            filters = {f"{time_field}__gte": params["date_from"]}
            if "date_to" in params:
                applied["date_to"] = params["date_to"]
                filters[f"{time_field}__lte"] = params["date_to"]
            return Q(**filters), applied

        applied["default_hours"] = default_hours
        return Q(**{f"{time_field}__gte": now - timedelta(hours=default_hours)}), applied

    @classmethod
    def _get_all_fields(cls, model: type[models.Model]) -> set:
        """
        Returns all field names from the given model.

        Args:
            model: Django model class

        Returns:
            set: set of model field names
        """
        fields = set()
        for model_field in model._meta.get_fields():
            if hasattr(model_field, "name"):
                fields.add(model_field.name)
            if hasattr(model_field, "attname"):
                fields.add(model_field.attname)
        return fields

    @classmethod
    def _get_indexed_fields(cls, model):
        """
        Extract all indexed field names from the given model.
        Args:
            model: Django model class

        Returns:
            set: set of model field names
        """
        indexed_fields = set()
        for model_field in model._meta.get_fields():
            if getattr(model_field, "db_index", False) or getattr(model_field, "primary_key", False):
                indexed_fields.add(model_field.name)
                if hasattr(model_field, "attname"):
                    indexed_fields.add(model_field.attname)

        for index in model._meta.indexes:
            if index.fields and len(index.fields) > 0:
                indexed_fields.add(index.fields[0])

        return indexed_fields

    @classmethod
    def _get_custom_filters(cls, model: type[models.Model], params: dict) -> tuple[Q, dict, dict]:
        """
        Hook method for subclasses to transform custom request params into Q filters.
        Must return a tuple of (Q_object, applied_dict, ignored_dict).
        """
        return Q(), {}, {}

    @classmethod
    def _get_extra_supported_params(cls) -> set:
        """
        Hook method for subclasses to declare virtual parameter names.
        """
        return set()

    @classmethod
    def _is_arch_model(cls, model: type[models.Model]) -> bool:
        """
        Returns True if the given model is an archive.
        Args:
            model: Django model class

        Returns:
            boolean
        """
        table_name = model._meta.db_table
        if "_arch" in table_name or "archived" in table_name:
            return True
        return False

    @classmethod
    def _validate_query_params(cls, model: type[models.Model], request_params: dict) -> None:
        """
        Validate the query parameters against the supported filters. Raises exception if the validation fails.
        Args:
            model: Django model class

        Returns:
            -
        """

        provided_params = set(request_params)
        all_supported_params = TIME_RANGE_PARAMS | META_PARAMS | cls._get_all_fields(model) | cls._get_extra_supported_params()

        unknown_params = provided_params - all_supported_params
        if unknown_params:
            _logger.warning(f"Unknown parameters provided: {unknown_params}")
            raise ValidationError(
                {
                    "error": "Invalid query parameters provided.",
                    "unknown_params": unknown_params,
                    "supported_params": all_supported_params,
                }
            )


def filter_single_queryset(
    queryset,
    request_params: dict,
    model: type[models.Model],
    time_field: str = "modificationtime",
    default_hours: int = 12,
    engine_cls: type[QueryFilterEngine] = QueryFilterEngine,
) -> tuple[models.QuerySet, FilterResult]:
    """Filter a standard single-table QuerySet."""
    result = engine_cls.build_q_filters(model=model, request_params=request_params, time_field=time_field, default_hours=default_hours)
    qs = queryset.filter(result.q_object).order_by(f"-{time_field}")
    return qs, result


def filter_union_queryset(
    models_list: list,
    request_params: dict,
    time_field: str = "modificationtime",
    default_hours: int = 12,
    values_list: list | None = None,
    do_union_all: bool = True,
    engine_cls: type[QueryFilterEngine] = QueryFilterEngine,
) -> tuple[Any, FilterResult | None]:
    """Filter individual models, then perform a SQL UNION."""
    filtered_qss = []
    result = None
    for i, model in enumerate(models_list):
        result_i = engine_cls.build_q_filters(
            model=model, request_params=request_params, time_field=time_field, default_hours=default_hours, force_time_filter=False
        )
        qs = model.objects.filter(result_i.q_object)
        if values_list:
            qs = qs.values(*values_list)
        filtered_qss.append(qs)
        # result of applied and ignored params are the same for identical tables -> get the first one.
        if i == 0:
            result = result_i

    unified_qs = filtered_qss[0].union(*filtered_qss[1:], all=do_union_all).order_by(f"-{time_field}")
    _logger.debug("SQL: %s", unified_qs.query)
    return unified_qs, result
