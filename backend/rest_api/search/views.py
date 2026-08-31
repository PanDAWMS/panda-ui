from rest_api.common.mixins.filter_result_header import FilterMetadataHeaderMixin
from rest_api.common.utils.filter_engine import filter_single_queryset, filter_union_queryset
from rest_api.job.models import JobsActive4, JobsArchived4, JobsDefined4
from rest_api.oauth.permissions import GlobalPermission
from rest_api.task.models import JediTask
from rest_framework import status
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class QuickSearchAPIView(FilterMetadataHeaderMixin, APIView):
    """
    Global search endpoint for lightweight system-wide routing.

    This view serves as a fast triage system, routing queries by format (e.g., numeric IDs) to minimize database search overhead.
    """

    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated, GlobalPermission]
    JOB_MODELS = [JobsDefined4, JobsActive4, JobsArchived4]

    def get(self, request, *args, **kwargs) -> Response:
        """
        Handles global search queries.

        Checks if the query 'q' is a numeric ID and performs fast primary key
        lookups across Tasks and Datasets.

        Args:
            request (Request): DRF request containing query params.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: A DRF Response object containing:
                - A list of matching result dictionaries with fields: `title`, `type`, and `id` (on HTTP 200 OK).
                - An empty list if no query parameter is provided (on HTTP 400 Bad Request).
                - An error message if a string query is passed (on HTTP 501 Not Implemented).
        """
        query = request.query_params.get("q", "").strip()
        if not query:
            return Response([], status=status.HTTP_400_BAD_REQUEST)

        results = []
        if query.isdigit():
            target_id = int(query)

            # check if the target_id exists in Jobs, Tasks, or Files
            task_qs, task_result = filter_single_queryset(
                queryset=JediTask.objects.all(), request_params={"jeditaskid": target_id}, model=JediTask, time_field="creationdate", default_hours=0
            )

            if task_qs.values("jeditaskid")[:1].exists():
                results.append(
                    {
                        "title": f"Task #{target_id}",
                        "type": "task",
                        "id": target_id,
                    }
                )
                self.filter_result = task_result

            job_qs, job_result = filter_union_queryset(
                models_list=self.JOB_MODELS,
                request_params={"pandaid": target_id},
                time_field="statechangetime",
                default_hours=0,
                values_list=["pandaid"],
            )
            if job_qs.exists():
                results.append(
                    {
                        "title": f"Job #{target_id}",
                        "type": "job",
                        "id": target_id,
                    }
                )
                self.filter_result = job_result

        else:
            return Response({"error": "String search is not implemented yet."}, status=status.HTTP_501_NOT_IMPLEMENTED)

        return Response(results, status=status.HTTP_200_OK)
