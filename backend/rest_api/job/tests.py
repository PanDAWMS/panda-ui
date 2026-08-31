import json

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_api.job.models import JobsArchived4
from rest_framework import status
from rest_framework.test import APISimpleTestCase

User = get_user_model()


class JobListTests(APISimpleTestCase):
    databases = {"default"}

    @classmethod
    def setUpClass(cls):
        # query the BP to get a ids of objects to test views of single objects like /job/<pandaid>/, /task/<taskid>/ etc
        cls.test_data = {
            "pandaid": None,
            "jeditaskid": None,
            "lfn": None,
            "produsername": None,
            "computingsite": None,
        }
        # get last job
        job = JobsArchived4.objects.order_by("-pandaid").first()
        if job:
            cls.test_data["pandaid"] = job.pandaid if job.pandaid is not None else 0
            cls.test_data["jeditaskid"] = job.jedi_task_id if job.jedi_task_id is not None else 0
            cls.test_data["computingsite"] = job.computingsite if job.computingsite is not None else ""
            cls.test_data["produsername"] = job.produsername if job.produsername is not None else ""
        print("[JobListTests] Test data for views:", cls.test_data)

    def setUp(self):
        """Get the last task from existing database and force auth for client."""
        self.url = reverse("job-list", kwargs={"version": "v1"})
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
        response = self.client.get(self.url, {"jedi_task_id": self.test_data["jeditaskid"], "hours": 12})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("X-Applied-Filters", response)
        applied_filters = json.loads(response["X-Applied-Filters"])
        self.assertIn("jedi_task_id", applied_filters)
        ignored_filters = json.loads(response["X-Ignored-Filters"])
        self.assertDictEqual(ignored_filters, {})

    def test_unindexed_param_triggers_time_fallback(self):
        """Unindexed Search: Querying without indexed fields falls back to time limit."""
        response = self.client.get(self.url, {"computingsite": self.test_data["computingsite"]})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("X-Applied-Filters", response)
        applied_filters = json.loads(response["X-Applied-Filters"])
        self.assertIn("default_hours", applied_filters)
