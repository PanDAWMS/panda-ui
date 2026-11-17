"""
Phase 1 notification evaluator (ATLASPANDA-1401).

Runs on a schedule (see the panda-ui Helm chart's notificationEvaluator CronJob) and
scans every task with at least one active Subscription, delegating the actual
per-task decision to rest_api.notifications.evaluator.evaluate_task() - see that
module's docstring for the lifecycle events and heuristics. This command is now a
periodic safety net alongside consume_task_status_events's event-driven evaluation
(see project_panda_ui_event_driven_notifications); NotificationLog's dedup means a
task this command re-checks after the event-driven consumer already handled it is a
no-op, not a duplicate email.
"""

from django.core.management.base import BaseCommand
from rest_api.notifications.evaluator import evaluate_task
from rest_api.notifications.models import Subscription


class Command(BaseCommand):
    help = "Evaluate task subscriptions and send lifecycle notification emails."

    def handle(self, *args, **options):
        jeditaskids = Subscription.objects.values_list("jeditaskid", flat=True).distinct()
        for jeditaskid in jeditaskids:
            evaluate_task(jeditaskid)
