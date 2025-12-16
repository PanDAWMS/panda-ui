class TaskFilterMixin:
    """
    Mixin to filter tasks based on query parameters.
    """

    def __init__(self):
        self.request = None

    def filter_tasks(self, qs):
        """
        Filters the given queryset of tasks based on the provided parameters.

        Args:
            qs: The initial queryset of tasks.

        Returns:
            A filtered queryset of tasks.
        """
        params = self.request.query_params
        filters = {}
        if "jeditaskid" in params:
            jeditaskid = int(params.get("jeditaskid"), 0)
            if jeditaskid > 0:
                filters["jeditaskid"] = jeditaskid
            else:
                raise ValueError("Invalid jeditaskid parameter")

        return qs.filter(**filters)
