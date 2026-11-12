from django.conf import settings
from django.db import models


class Subscription(models.Model):
    """
    A user's subscription to lifecycle notifications for a single JEDI task.

    managed = False: like every other business-data model in this repo
    (task/job/workflow), this table is created/altered by hand against the
    real DB rather than via Django migrations - schema changes here go
    through the DBA-managed process, not `manage.py migrate`. See the DDL
    reference in this app's pull request description.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_constraint=False,
        related_name="task_subscriptions",
    )
    jeditaskid = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = f'"{settings.DB_SCHEMAS["pandaui"]}"."notifications_subscription"'
        unique_together = ("user", "jeditaskid")
        indexes = [models.Index(fields=["jeditaskid"])]

    def __str__(self):
        return f"{self.user} -> task {self.jeditaskid}"


class NotificationLog(models.Model):
    """
    Records that a given lifecycle event has already been sent to a given
    subscriber for a task, so the evaluator never sends the same event to the
    same subscriber twice. Scoped per subscriber (not just per task) so that a
    subscriber who joins after an event already fired for an earlier
    subscriber still gets notified themselves.

    managed = False - see Subscription's docstring.
    """

    EVENT_JOBS_STARTING = "jobs_starting"
    EVENT_NO_RUNNING_JOBS = "no_running_jobs"
    EVENT_CHOICES = [
        (EVENT_JOBS_STARTING, "Jobs Starting"),
        (EVENT_NO_RUNNING_JOBS, "No Running Jobs"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_constraint=False,
        related_name="notification_logs",
    )
    jeditaskid = models.BigIntegerField()
    event_type = models.CharField(max_length=32, choices=EVENT_CHOICES)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = f'"{settings.DB_SCHEMAS["pandaui"]}"."notifications_notificationlog"'
        # unique_together already creates an index on exactly these columns;
        # a second explicit index on the same column list is redundant and
        # Oracle rejects it outright (ORA-01408), unlike Postgres which
        # silently tolerates the duplicate.
        unique_together = ("user", "jeditaskid", "event_type")

    def __str__(self):
        return f"{self.user} / task {self.jeditaskid}: {self.event_type}"
