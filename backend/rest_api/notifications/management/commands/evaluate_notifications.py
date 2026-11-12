"""
Phase 1 notification evaluator (ATLASPANDA-1401).

Runs on a schedule (see the panda-ui Helm chart's notifications CronJob) and, for
every task with at least one active Subscription, checks for two lifecycle events
and emails each subscriber at most once per event per subscriber (not just once per
event per task - a subscriber who joins after an event already fired for an earlier
subscriber still gets notified themselves):

* "jobs_starting" - the task has at least one job that has moved past the
  pre-dispatch statuses (i.e. a pilot has actually picked up work), and it still
  has jobs running right now.
* "no_running_jobs" - the task has progressed past the pre-dispatch statuses but
  currently has no jobs running - it may be finished, broken, or between brokering
  stages. The email includes a per-status job count breakdown.

A subscriber who joins a task that's already past both stages (e.g. it finished
before they subscribed) only gets the "no_running_jobs" email, not "jobs_starting"
followed immediately by "no_running_jobs" - by the time they're looking at it, the
task isn't starting anymore, so there's no reason to say so.

Deliberately simple heuristics for phase 1, matching Tatiana Korchuganova's "start
simple" guidance on ATLASPANDA-1401 - the scout-failure-rate and wall-time-loss
warnings from the original spec are phase 2+.
"""

import logging
from collections import Counter

from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand

from rest_api.job.models import JobsActive4, JobsArchived4, JobsDefined4
from rest_api.notifications.mail_templates import render_notification_email
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
            subscribers = list(Subscription.objects.filter(jeditaskid=jeditaskid).select_related("user"))
            status_counts = self._job_status_counts(jeditaskid)
            has_progressed = any(status not in PRE_RUN_STATUSES for status in status_counts)
            no_running = status_counts.get("running", 0) == 0
            if not has_progressed:
                continue  # task hasn't done anything yet - nothing to tell anyone
            if no_running:
                # already past running, however it got there - just say where it ended up now
                self._maybe_notify_no_running_jobs(jeditaskid, status_counts, subscribers)
            else:
                self._maybe_notify_jobs_starting(jeditaskid, status_counts, subscribers)

    @staticmethod
    def _job_status_counts(jeditaskid: int) -> Counter:
        counts: Counter = Counter()
        for model in JOB_MODELS:
            qs = model.objects.filter(jedi_task_id=jeditaskid).values_list("jobstatus", flat=True)
            counts.update(qs)
        return counts

    @staticmethod
    def _notified_user_ids(jeditaskid: int, event_type: str) -> set:
        return set(NotificationLog.objects.filter(jeditaskid=jeditaskid, event_type=event_type).values_list("user_id", flat=True))

    def _maybe_notify_jobs_starting(self, jeditaskid: int, status_counts: Counter, subscribers: list) -> None:
        already_notified = self._notified_user_ids(jeditaskid, NotificationLog.EVENT_JOBS_STARTING)
        pending = [s for s in subscribers if s.user_id not in already_notified]
        if not pending:
            return
        n_total = sum(status_counts.values())
        n_started = sum(count for status, count in status_counts.items() if status not in PRE_RUN_STATUSES)
        subject = f"panda-ui notification for TaskID:{jeditaskid} ({n_started}/{n_total} Started)"
        message = "Jobs are starting for the task you subscribed to."
        task_url = self._task_url(jeditaskid)
        body = f"{message}\n\nTaskID: {jeditaskid}\n{task_url}"
        html_body = render_notification_email(jeditaskid, task_url, message, status_counts)
        self._send_and_log(jeditaskid, NotificationLog.EVENT_JOBS_STARTING, subject, body, html_body, pending)

    def _maybe_notify_no_running_jobs(self, jeditaskid: int, status_counts: Counter, subscribers: list) -> None:
        already_notified = self._notified_user_ids(jeditaskid, NotificationLog.EVENT_NO_RUNNING_JOBS)
        pending = [s for s in subscribers if s.user_id not in already_notified]
        if not pending:
            return
        # A subscriber who's getting "no_running_jobs" without ever having gotten "jobs_starting" (joined
        # after the task had already finished) shouldn't later receive a stale "jobs starting" email if
        # this command somehow re-evaluates them against an earlier state - mark that stage as done too.
        already_started = self._notified_user_ids(jeditaskid, NotificationLog.EVENT_JOBS_STARTING)
        skipped_starting = [s for s in pending if s.user_id not in already_started]
        for subscriber in skipped_starting:
            NotificationLog.objects.create(user_id=subscriber.user_id, jeditaskid=jeditaskid, event_type=NotificationLog.EVENT_JOBS_STARTING)
        n_total = sum(status_counts.values())
        n_succeeded = status_counts.get("finished", 0)
        msg_succeeded = "All Succeeded" if n_total and n_succeeded == n_total else "Succeeded"
        subject = f"panda-ui notification for TaskID:{jeditaskid} ({n_succeeded}/{n_total} {msg_succeeded})"
        breakdown = ", ".join(f"{count} {status}" for status, count in sorted(status_counts.items()))
        message = "No jobs are running for the task you subscribed to."
        task_url = self._task_url(jeditaskid)
        body = f"{message} Current state is: {breakdown}.\n\nTaskID: {jeditaskid}\n{task_url}"
        html_body = render_notification_email(jeditaskid, task_url, message, status_counts)
        self._send_and_log(jeditaskid, NotificationLog.EVENT_NO_RUNNING_JOBS, subject, body, html_body, pending)

    @staticmethod
    def _task_url(jeditaskid: int) -> str:
        return f"{settings.FRONTEND_BASE_URL}/task/{jeditaskid}"

    def _send_and_log(self, jeditaskid: int, event_type: str, subject: str, body: str, html_body: str, subscribers: list) -> None:
        recipients = [s.user.email for s in subscribers if s.user.email]
        if recipients:
            send_mail(
                subject=subject,
                message=body,
                from_email=None,
                recipient_list=recipients,
                fail_silently=False,
                html_message=html_body,
            )
        else:
            logger.warning("No subscriber has an email address on file for task %s event %s", jeditaskid, event_type)
        for subscriber in subscribers:
            NotificationLog.objects.create(user_id=subscriber.user_id, jeditaskid=jeditaskid, event_type=event_type)
        logger.info(
            "Sent %s notification for task %s to %d recipient(s), logged for %d subscriber(s)", event_type, jeditaskid, len(recipients), len(subscribers)
        )
