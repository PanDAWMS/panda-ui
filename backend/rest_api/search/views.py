from rest_api.task.models import JediTask
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class QuickSearchAPIView(APIView):
    """
    Global search endpoint for lightweight system-wide routing.

    This view serves as a fast triage system, routing queries by format (e.g., numeric IDs) to minimize database search overhead.
    """

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
            if JediTask.objects.filter(jeditaskid=target_id).exists():
                results.append({"title": f"Task #{target_id}", "type": "task", "id": f"{target_id}"})

        else:
            return Response({"error": "String search is not implemented yet."}, status=status.HTTP_501_NOT_IMPLEMENTED)

        return Response(results, status=status.HTTP_200_OK)
