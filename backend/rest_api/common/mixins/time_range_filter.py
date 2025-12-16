from datetime import timedelta

from django.utils import timezone


class TimeRangeFilterMixin:
    """
    Mixin to add time range filtering capabilities to API views.
    """

    default_hours = 12

    def __init__(self):
        self.request = None

    def filter_by_time(self, qs):
        """
        Extracts the time range parameters from the request.

        Returns:
            tuple: A tuple containing start_time and end_time.
        """
        now = timezone.now()
        time_field = "modificationdate"  # Default time field
        time_range_params = (
            "days",
            "hours",
            "date_from",
            "date_to",
        )

        params = self.request.query_params
        time_range_requested = {param: params.get(param) for param in time_range_params if params.get(param) is not None}

        # relative time range
        if "days" in time_range_requested:
            days = int(time_range_requested.get("days", 0))
            return qs.filter(**{f"{time_field}__gte": now - timedelta(days=days)}).order_by(f"-{time_field}")
        if "hours" in time_range_requested:
            hours = int(time_range_requested.get("hours", self.default_hours))
            return qs.filter(**{f"{time_field}__gte": now - timedelta(hours=hours)}).order_by(f"-{time_field}")

        # absolute time range
        if "date_from" in time_range_requested and "date_to" in time_range_requested:
            date_from = time_range_requested["date_from"]
            date_to = time_range_requested["date_to"]
            return qs.filter(**{f"{time_field}__range": (date_from, date_to)}).order_by(f"-{time_field}")

        return qs.filter(**{f"{time_field}__gte": now - timedelta(hours=self.default_hours)}).order_by(f"-{time_field}")
