"""
Event-driven notification evaluator (ATLASPANDA-1401 phase 2).

Long-running daemon, not a one-shot command: subscribes to JEDI's
panda_ui_task_status ActiveMQ queue (see jedi_msg_proc_config.json's
push_task_status fan-out and project_panda_ui_event_driven_notifications) and
calls evaluator.evaluate_task() as soon as a real task-status transition arrives,
instead of waiting for evaluate_notifications's next 5-minute poll.

Uses pandacommon.pandamsgbkr.msg_processor.MsgProcAgentBase in "passive mode" -
the same primitive pandajedi.jedicore.JediDBProxy.get_mb_proxy_dict() uses - so
connection/reconnect handling is the same proven code path already verified
end-to-end on this exact queue, rather than a hand-rolled stomp.py client.

The task-status message only carries {"taskid", "status"} - a coarse task-level
enum - so it only tells us *when* to check a task, not what to say; evaluate_task()
still does the same job-status-count query evaluate_notifications always has.
evaluate_notifications's CronJob keeps running as a safety net for any gap (a
missed message during a restart, for example) - NotificationLog's dedup means
that's a no-op, not a duplicate email.
"""

import json
import logging
import os
import time

from django.core.management.base import BaseCommand
from pandacommon.pandamsgbkr.msg_bkr_utils import MsgBuffer
from pandacommon.pandamsgbkr.msg_processor import MsgProcAgentBase
from rest_api.notifications.evaluator import evaluate_task

logger = logging.getLogger("notifications")

QUEUE_NAME = "panda_ui_task_status"
HEARTBEAT_FILE = "/tmp/consumer-heartbeat"


class Command(BaseCommand):
    help = "Consume JEDI task-status events and evaluate/send notifications as they arrive."

    def handle(self, *args, **options):
        config_file = os.environ["PANDAUI_MQ_CONFIG_FILE"]
        agent = MsgProcAgentBase(config_file=config_file)
        agent.start_passive_mode(in_q_list=[QUEUE_NAME])
        msg_buffer = MsgBuffer(queue_name=QUEUE_NAME)
        logger.info("consume_task_status_events started, listening on %s", QUEUE_NAME)
        while True:
            self._touch_heartbeat()
            msg_obj = msg_buffer.get()
            if msg_obj is None:
                time.sleep(0.5)
                continue
            try:
                with msg_obj as _msg_obj:
                    self._handle_message(_msg_obj.data)
            except Exception:
                # one bad/unexpected message must never kill this loop - an uncaught
                # exception in an unmonitored background thread dies silently with no
                # trace anywhere, which is exactly the failure mode that left JEDI's
                # own message processor dead for six months before anyone noticed.
                logger.exception("failed to handle task-status message, skipping")

    @staticmethod
    def _touch_heartbeat():
        with open(HEARTBEAT_FILE, "w"):
            pass

    @staticmethod
    def _handle_message(raw: str) -> None:
        msg = json.loads(raw)
        if msg.get("msg_type") != "task_status":
            return
        jeditaskid = msg.get("taskid")
        if jeditaskid is None:
            return
        evaluate_task(jeditaskid)
