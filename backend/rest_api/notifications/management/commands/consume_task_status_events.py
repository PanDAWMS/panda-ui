"""
Event-driven notification evaluator (ATLASPANDA-1401 phase 2).

Long-running daemon, not a one-shot command: subscribes to two ActiveMQ feeds
and keeps panda-ui in sync with them in real time, instead of waiting for
evaluate_notifications's next 5-minute poll:

* panda_ui_task_status - JEDI's own queue (see jedi_msg_proc_config.json's
  push_task_status fan-out). A task_status message only carries
  {"taskid", "status"} - a coarse task-level enum - so it only tells us *when*
  to check a task; on arrival we call evaluator.evaluate_task() for it.
* panda_jobstatus_feed - panda-server's job_status messages on the shared
  /topic/panda_idds topic (push_job_status_message(), same topic iDDS
  consumes - a real ActiveMQ topic, so subscribing here doesn't compete with
  iDDS for messages). Each one is a single job's current status; we mirror it
  into JobStatusCache (filtered to tasks someone is actually subscribed to -
  this topic carries every job site-wide once pushStatusChanges is at 100%)
  so evaluate_task() can read job counts from that local cache instead of
  querying JobsDefined4/JobsActive4/JobsArchived4 on every check.

Uses pandacommon.pandamsgbkr.msg_processor.MsgProcAgentBase in "passive mode" -
the same primitive pandajedi.jedicore.JediDBProxy.get_mb_proxy_dict() uses - so
connection/reconnect handling is the same proven code path already verified
end-to-end on the task-status queue, rather than a hand-rolled stomp.py client.

Topic subscriptions here are not durable (pandacommon sets no
activemq.subscriptionName/persistent client-id), so a job_status message
published while this consumer is down is lost, not just delayed - unlike the
point-to-point task_status queue, where messages persist until acked.
evaluator.py's cache-miss fallback to the job tables is what recovers from
that gap, not this consumer. evaluate_notifications's CronJob also keeps
running as a safety net for task-status-level gaps - NotificationLog's dedup
means that's a no-op, not a duplicate email.
"""

import json
import logging
import os
import time

from django.core.management.base import BaseCommand
from pandacommon.pandamsgbkr.msg_bkr_utils import MsgBuffer
from pandacommon.pandamsgbkr.msg_processor import MsgProcAgentBase
from rest_api.notifications.evaluator import evaluate_task
from rest_api.notifications.models import JobStatusCache, Subscription

logger = logging.getLogger("notifications")

TASK_STATUS_QUEUE = "panda_ui_task_status"
JOB_STATUS_QUEUE = "panda_jobstatus_feed"
HEARTBEAT_FILE = "/tmp/consumer-heartbeat"


class Command(BaseCommand):
    help = "Consume JEDI task-status and panda-server job-status events and evaluate/send notifications as they arrive."

    def handle(self, *args, **options):
        config_file = os.environ["PANDAUI_MQ_CONFIG_FILE"]
        agent = MsgProcAgentBase(config_file=config_file)
        agent.start_passive_mode(in_q_list=[TASK_STATUS_QUEUE, JOB_STATUS_QUEUE])
        task_status_buffer = MsgBuffer(queue_name=TASK_STATUS_QUEUE)
        job_status_buffer = MsgBuffer(queue_name=JOB_STATUS_QUEUE)
        logger.info("consume_task_status_events started, listening on %s and %s", TASK_STATUS_QUEUE, JOB_STATUS_QUEUE)
        while True:
            self._touch_heartbeat()
            got_any = False
            for msg_buffer, handler in (
                (task_status_buffer, self._handle_task_status_message),
                (job_status_buffer, self._handle_job_status_message),
            ):
                msg_obj = msg_buffer.get()
                if msg_obj is None:
                    continue
                got_any = True
                try:
                    with msg_obj as _msg_obj:
                        handler(_msg_obj.data)
                except Exception:
                    # one bad/unexpected message must never kill this loop - an uncaught
                    # exception in an unmonitored background thread dies silently with no
                    # trace anywhere, which is exactly the failure mode that left JEDI's
                    # own message processor dead for six months before anyone noticed.
                    logger.exception("failed to handle message, skipping")
            if not got_any:
                time.sleep(0.5)

    @staticmethod
    def _touch_heartbeat():
        with open(HEARTBEAT_FILE, "w"):
            pass

    @staticmethod
    def _handle_task_status_message(raw: str) -> None:
        msg = json.loads(raw)
        if msg.get("msg_type") != "task_status":
            return
        jeditaskid = msg.get("taskid")
        if jeditaskid is None:
            return
        evaluate_task(jeditaskid)

    @staticmethod
    def _handle_job_status_message(raw: str) -> None:
        msg = json.loads(raw)
        if msg.get("msg_type") != "job_status":
            # /topic/panda_idds also carries task_status messages (forwarded there by
            # JEDI's own to-idds sender) - already handled via the dedicated queue above.
            return
        jeditaskid = msg.get("taskid")
        pandaid = msg.get("jobid")
        status = msg.get("status")
        if jeditaskid is None or pandaid is None or status is None:
            return
        if not Subscription.objects.filter(jeditaskid=jeditaskid).exists():
            # this topic carries every job site-wide - only mirror the tiny subset
            # someone is actually subscribed to.
            return
        JobStatusCache.objects.update_or_create(pandaid=pandaid, defaults={"jeditaskid": jeditaskid, "status": status})
