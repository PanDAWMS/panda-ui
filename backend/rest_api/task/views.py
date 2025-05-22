from django.http import HttpRequest
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, permissions


class TaskView(generics.ListAPIView):
    """
    View to handle task-related requests.
    """
    authentication_classes = [authentication.TokenAuthentication, authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self, request: HttpRequest):
        """
        Handle GET requests for task information.
        """
        # Implement your logic here
        return Response({"message": "GET request received"})



