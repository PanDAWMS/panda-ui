"""
Phase 1 notification evaluator (ATLASPANDA-1401).

Runs on a schedule (see the panda-ui Helm chart's notifications CronJob) and, for
every task with at least one active Subscription, checks for two lifecycle events
and emails each subscriber at most once per event per task:

* "jobs_starting" - the task has at least one job that has moved past the
  pre-dispatch statuses (i.e. a pilot has actually picked up work).
* "no_running_jobs" - the task previously had running jobs (jobs_starting already
  fired) but currently has none running - it may be finished, broken, or between
  brokering stages. The email includes a per-status job count breakdown.

Deliberately simple heuristics for phase 1, matching Tatiana Korchuganova's "start
simple" guidance on ATLASPANDA-1401 - the scout-failure-rate and wall-time-loss
warnings from the original spec are phase 2+.
"""

import logging
from collections import Counter

from django.core.mail import send_mail
from django.core.management.base import BaseCommand
from rest_api.job.models import JobsActive4, JobsArchived4, JobsDefined4
from rest_api.notifications.models import NotificationLog, Subscription

logger = logging.getLogger("notifications")

JOB_MODELS = [JobsDefined4, JobsActive4, JobsArchived4]

# Statuses a job passes through before a pilot has actually started running it.
PRE_RUN_STATUSES = {"defined", "assigned", "waiting", "activated", "sent", "starting", "throttled"}


class Command(BaseCommand):
    help = "Evaluate task subscriptions and send lifecycle notification emails."

    def handle(self, *args, **options):
        jeditaskids = Subscription.objects.values_list("jeditaskid", flat=True).distinct()
        for jeditaskid in jeditaskids:
            status_counts = self._job_status_counts(jeditaskid)
            self._maybe_notify_jobs_starting(jeditaskid, status_counts)
            self._maybe_notify_no_running_jobs(jeditaskid, status_counts)

    @staticmethod
    def _job_status_counts(jeditaskid: int) -> Counter:
        counts: Counter = Counter()
        for model in JOB_MODELS:
            qs = model.objects.filter(jedi_task_id=jeditaskid).values_list("jobstatus", flat=True)
            counts.update(qs)
        return counts

    def _maybe_notify_jobs_starting(self, jeditaskid: int, status_counts: Counter) -> None:
        if NotificationLog.objects.filter(jeditaskid=jeditaskid, event_type=NotificationLog.EVENT_JOBS_STARTING).exists():
            return
        has_progressed = any(status not in PRE_RUN_STATUSES for status in status_counts)
        if not has_progressed:
            return
        subject = "Jobs are starting for your subscribed task"
        body = f"Jobs are starting for the task you subscribed to (jeditaskid={jeditaskid})."
        self._send_and_log(jeditaskid, NotificationLog.EVENT_JOBS_STARTING, subject, body)

    def _maybe_notify_no_running_jobs(self, jeditaskid: int, status_counts: Counter) -> None:
        if not NotificationLog.objects.filter(jeditaskid=jeditaskid, event_type=NotificationLog.EVENT_JOBS_STARTING).exists():
            return  # don't declare "no running jobs" before anything has ever run
        if NotificationLog.objects.filter(jeditaskid=jeditaskid, event_type=NotificationLog.EVENT_NO_RUNNING_JOBS).exists():
            return
        if status_counts.get("running", 0) > 0:
            return
        breakdown = ", ".join(f"{count} {status}" for status, count in sorted(status_counts.items()))
        subject = "No jobs are running for your subscribed task"
        body = f"No jobs are running for the task you subscribed to (jeditaskid={jeditaskid}). Current state is: {breakdown}."
        self._send_and_log(jeditaskid, NotificationLog.EVENT_NO_RUNNING_JOBS, subject, body)

    def _send_and_log(self, jeditaskid: int, event_type: str, subject: str, body: str) -> None:
        recipients = list(
            Subscription.objects.filter(jeditaskid=jeditaskid).exclude(user__email="").values_list("user__email", flat=True).distinct()
        )
        if recipients:
            send_mail(subject=subject, message=body, from_email=None, recipient_list=recipients, fail_silently=False)
        else:
            logger.warning("No subscriber has an email address on file for task %s event %s", jeditaskid, event_type)
        NotificationLog.objects.create(jeditaskid=jeditaskid, event_type=event_type)
        logger.info("Sent %s notification for task %s to %d recipient(s)", event_type, jeditaskid, len(recipients))
