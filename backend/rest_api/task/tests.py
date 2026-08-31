import json

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_api.task.models import JediTask
from rest_framework import status
from rest_framework.test import APISimpleTestCase

User = get_user_model()


class TaskListTests(APISimpleTestCase):
    databases = {"default"}

    @classmethod
    def setUpClass(cls):
        # query the BP to get a ids of objects to test views of single objects like /job/<pandaid>/, /task/<taskid>/ etc
        cls.test_data = {
            "jeditaskid": None,
        }
        # get last finished job
        task = JediTask.objects.order_by("-jeditaskid").first()
        if task:
            cls.test_data["jeditaskid"] = task.jeditaskid
        else:
            cls.skipTest("No existing JediTask records found in the database.")
        print("[TaskListTests] test data for views:", cls.test_data)

    def setUp(self):
        """Get the last task from existing database and force auth for client."""
        self.url = reverse("task-list", kwargs={"version": "v1"})
        # force authentication on the DRF test client with testuser
        self.user, _ = User.objects.get_or_create(username="testuser")
        self.client.force_authenticate(user=self.user)

    def test_unknown_parameter_raises_400(self):
        """Typo Check: Passing unknown query params should fail with HTTP 400."""
        response = self.client.get(self.url, {"invalid_param": "test"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("unknown_params", response.data)

    def test_indexed_param_bypasses_time_fallback(self):
        """Indexed Search: Searching by jeditaskid shouldn't enforce default 12h time limit."""
        response = self.client.get(self.url, {"jeditaskid": self.test_data["jeditaskid"]})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("X-Applied-Filters", response)
        applied_filters = json.loads(response["X-Applied-Filters"])
        self.assertIn("jeditaskid", applied_filters)

    def test_unindexed_param_triggers_time_fallback(self):
        """Unindexed Search: Querying without indexed fields falls back to time limit."""
        response = self.client.get(self.url, {"hours": 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("X-Applied-Filters", response)
        applied_filters = json.loads(response["X-Applied-Filters"])
        self.assertIn("hours", applied_filters)
