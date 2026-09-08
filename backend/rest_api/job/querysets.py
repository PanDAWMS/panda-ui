from django.db.models import Q
from rest_api.common.utils.filter_engine import QueryFilterEngine
from rest_api.job.models import JobBaseModel


class JobUnionQuerySet:
    """
    Decides which fields to get from Jobs* tables for better performance
    """

    STANDARD_TASK_FIELDS = (
        "jedi_task__jeditaskid",
        "jedi_task__taskname",
        "jedi_task__status",
        "jedi_task__username",
    )

    STANDARD_JOB_FIELDS = ("pandaid", "jedi_task_id", "jobstatus", "creationtime", "starttime", "endtime", "statechangetime", "computingsite", "produsername")

    @classmethod
    def get_values_list(cls, is_all: bool = False, is_with_task: bool = False):
        """
        Get list of values for queryset to retrieve from DB
        Args:
            is_all: bool - all of available fields
            is_with_task: bool - add standard fields of related tasks

        Returns:
            values_list: list of values for queryset
        """
        if is_all:
            values_list = [f.name for f in JobBaseModel._meta.concrete_fields if not f.is_relation]
        else:
            values_list = list(cls.STANDARD_JOB_FIELDS)
        if is_with_task:
            values_list.extend(list(cls.STANDARD_TASK_FIELDS))
        return values_list


class JobFilterFilter(QueryFilterEngine):
    """Job-specific filtering rules."""

    @classmethod
    def _get_extra_supported_params(cls) -> set:
        return {"type"}

    @classmethod
    def _get_custom_filters(cls, model, params: dict) -> Q:
        q = Q()
        applied = {}
        ignored = {}
        if "type" in params:
            val = params.pop("type")
            matched_q = None
            match val:
                case "analy":
                    matched_q = Q(prodsourcelabel="user")
                case "prod":
                    matched_q = Q(prodsourcelabel="managed")
                case "test":
                    matched_q = Q(prodsourcelabel="test")

            # Single tracking check after matching
            if matched_q:
                q &= matched_q
                applied["type"] = val
            else:
                ignored["type"] = val
        return q, applied, ignored
