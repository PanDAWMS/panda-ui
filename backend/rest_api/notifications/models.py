from django.conf import settings
from django.db import models


class Subscription(models.Model):
    """
    A user's subscription to lifecycle notifications for a single JEDI task.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="task_subscriptions",
    )
    jeditaskid = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "jeditaskid")
        indexes = [models.Index(fields=["jeditaskid"])]

    def __str__(self):
        return f"{self.user} -> task {self.jeditaskid}"


class NotificationLog(models.Model):
    """
    Records that a given lifecycle event has already been sent for a task,
    so the evaluator never sends the same event twice.
    """

    EVENT_JOBS_STARTING = "jobs_starting"
    EVENT_NO_RUNNING_JOBS = "no_running_jobs"
    EVENT_CHOICES = [
        (EVENT_JOBS_STARTING, "Jobs Starting"),
        (EVENT_NO_RUNNING_JOBS, "No Running Jobs"),
    ]

    jeditaskid = models.BigIntegerField()
    event_type = models.CharField(max_length=32, choices=EVENT_CHOICES)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # unique_together already creates an index on exactly these columns;
        # a second explicit index on the same column list is redundant and
        # Oracle rejects it outright (ORA-01408), unlike Postgres which
        # silently tolerates the duplicate.
        unique_together = ("jeditaskid", "event_type")

    def __str__(self):
        return f"task {self.jeditaskid}: {self.event_type}"
