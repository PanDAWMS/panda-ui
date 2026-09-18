from django.conf import settings
from django.db import models


class Workflow(models.Model):
    workflow_id = models.BigIntegerField(primary_key=True, db_column="workflow_id")
    name = models.CharField(max_length=256, null=True, blank=True, db_column="name")
    parent_id = models.BigIntegerField(null=True, blank=True, db_column="parent_id")
    loop_count = models.IntegerField(null=True, blank=True, db_column="loop_count")
    status = models.CharField(max_length=32, null=True, blank=True, db_column="status")
    prodsourcelabel = models.CharField(max_length=32, null=True, blank=True, db_column="prodsourcelabel")
    username = models.CharField(max_length=128, null=True, blank=True, db_column="username")
    creation_time = models.DateTimeField(null=True, blank=True, db_column="creation_time")
    start_time = models.DateTimeField(null=True, blank=True, db_column="start_time")
    end_time = models.DateTimeField(null=True, blank=True, db_column="end_time")
    modification_time = models.DateTimeField(null=True, blank=True, db_column="modification_time")
    check_time = models.DateTimeField(null=True, blank=True, db_column="check_time")
    locked_by = models.CharField(max_length=64, null=True, blank=True, db_column="locked_by")
    lock_time = models.DateTimeField(null=True, blank=True, db_column="lock_time")
    raw_request_json = models.TextField(null=True, blank=True, db_column="raw_request_json")
    definition_json = models.TextField(null=True, blank=True, db_column="definition_json")
    parameters = models.TextField(null=True, blank=True, db_column="parameters")

    class Meta:
        managed = False
        app_label = "workflow"
        db_table = f'"{settings.DB_SCHEMAS['panda']}"."workflows"'
        verbose_name = "Workflow"
        verbose_name_plural = "Workflows"

        indexes = [
            models.Index(fields=["workflow_id"]),
        ]


class WorkflowStep(models.Model):
    step_id = models.BigIntegerField(primary_key=True, db_column="step_id")
    name = models.CharField(max_length=256, null=True, blank=True, db_column="name")
    member_id = models.BigIntegerField(db_column="member_id")
    type = models.CharField(max_length=32, null=True, blank=True, db_column="type")
    status = models.CharField(max_length=32, null=True, blank=True, db_column="status")
    flavor = models.CharField(max_length=32, null=True, blank=True, db_column="flavor")
    target_id = models.CharField(max_length=128, null=True, blank=True, db_column="target_id")
    creation_time = models.DateTimeField(null=True, blank=True, db_column="creation_time")
    start_time = models.DateTimeField(null=True, blank=True, db_column="start_time")
    end_time = models.DateTimeField(null=True, blank=True, db_column="end_time")
    modification_time = models.DateTimeField(null=True, blank=True, db_column="modification_time")
    check_time = models.DateTimeField(null=True, blank=True, db_column="check_time")
    locked_by = models.CharField(max_length=64, null=True, blank=True, db_column="locked_by")
    lock_time = models.DateTimeField(null=True, blank=True, db_column="lock_time")
    definition_json = models.TextField(null=True, blank=True, db_column="definition_json")
    parameters = models.TextField(null=True, blank=True, db_column="parameters")

    workflow = models.ForeignKey(
        Workflow,
        on_delete=models.DO_NOTHING,
        db_column="workflow_id",
        related_name="steps",
    )

    class Meta:
        managed = False
        app_label = "workflow"
        db_table = f'"{settings.DB_SCHEMAS["panda"]}"."workflow_steps"'
        verbose_name = "Step"
        verbose_name_plural = "Steps"

        indexes = [
            models.Index(fields=["step_id"]),
        ]


class WorkflowData(models.Model):
    data_id = models.BigIntegerField(primary_key=True, db_column="data_id")
    name = models.CharField(max_length=256, null=True, blank=True, db_column="name")
    type = models.CharField(max_length=32, null=True, blank=True, db_column="type")
    status = models.CharField(max_length=32, null=True, blank=True, db_column="status")
    flavor = models.CharField(max_length=32, null=True, blank=True, db_column="flavor")
    target_id = models.CharField(max_length=256, null=True, blank=True, db_column="target_id")
    creation_time = models.DateTimeField(null=True, blank=True, db_column="creation_time")
    start_time = models.DateTimeField(null=True, blank=True, db_column="start_time")
    end_time = models.DateTimeField(null=True, blank=True, db_column="end_time")
    modification_time = models.DateTimeField(null=True, blank=True, db_column="modification_time")
    check_time = models.DateTimeField(null=True, blank=True, db_column="check_time")
    locked_by = models.CharField(max_length=64, null=True, blank=True, db_column="locked_by")
    lock_time = models.DateTimeField(null=True, blank=True, db_column="lock_time")
    metadata = models.TextField(null=True, blank=True, db_column="metadata")
    parameters = models.TextField(null=True, blank=True, db_column="parameters")

    workflow = models.ForeignKey(
        Workflow,
        on_delete=models.DO_NOTHING,
        db_column="workflow_id",
        related_name="data_items",
    )
    source_step = models.ForeignKey(
        WorkflowStep,
        on_delete=models.DO_NOTHING,
        db_column="source_step_id",
        related_name="data_items",
        null=True,
        blank=True,
    )

    class Meta:
        managed = False
        app_label = "workflow"
        db_table = f'"{settings.DB_SCHEMAS["panda"]}"."workflow_data"'
        verbose_name = "Workflow Data"
        verbose_name_plural = "Workflow Data"

        indexes = [
            models.Index(fields=["data_id"]),
        ]
