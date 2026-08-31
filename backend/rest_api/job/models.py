from django.conf import settings
from django.db import models


class ErrorDescription(models.Model):
    """
    ErrorDescription model
    """

    id = models.AutoField(primary_key=True, db_column="id")
    component = models.CharField(max_length=32, db_column="component", blank=False, null=False)
    code = models.IntegerField(db_column="code", blank=False, null=False)
    acronym = models.CharField(max_length=64, db_column="acronym", blank=True, null=True)
    diagnostics = models.CharField(max_length=255, db_column="diagnostics", blank=True, null=True)
    description = models.CharField(max_length=4000, db_column="description", blank=True, null=True)
    category = models.IntegerField(db_column="category", blank=True, null=True)

    class Meta:
        managed = False
        app_label = "job"
        db_table = f'"{settings.DB_SCHEMAS['panda']}"."error_descriptions"'
        unique_together = (("component", "code"),)


class JobBaseModel(models.Model):
    """
    Base model for job DB tables
    """

    pandaid = models.BigIntegerField(db_column="pandaid", null=False, primary_key=True)
    creationtime = models.DateTimeField(db_column="creationtime", null=False)
    computingsite = models.CharField(max_length=32, db_column="computingsite", null=True)
    produsername = models.CharField(max_length=64, db_column="produsername", null=True)
    jobstatus = models.CharField(max_length=16, db_column="jobstatus", null=True)
    starttime = models.DateTimeField(db_column="starttime", null=True)
    endtime = models.DateTimeField(db_column="endtime", null=True)
    statechangetime = models.DateTimeField(db_column="statechangetime", null=True)

    jedi_task = models.ForeignKey(
        "task.JediTask", on_delete=models.DO_NOTHING, db_column="jeditaskid", to_field="jeditaskid", db_constraint=False, related_name="%(class)s_jobs"
    )

    class Meta:
        abstract = True
        managed = False
        indexes = [
            models.Index(fields=["pandaid"]),
            models.Index(fields=["jobname"]),
            models.Index(fields=["jeditaskid", "pandaid"]),
            models.Index(fields=["jobsetid"]),
            models.Index(fields=["reqid"]),
            models.Index(fields=["workqueue_id", "cloud", "jobstatus", "prodsourcelabel", "currentpriority"]),
            models.Index(fields=["statechangetime"]),
            models.Index(fields=["prodsourcelabel", "computingsite", "jobstatus"]),
            models.Index(fields=["produsername"]),
        ]


class JobsDefined4(JobBaseModel):
    """
    JobsDefined4 model - jobs that have been defined but not yet actively running.
    """

    class Meta:
        managed = False
        app_label = "job"
        db_table = f'"{settings.DB_SCHEMAS["panda"]}"."jobsdefined4"'


class JobsActive4(JobBaseModel):
    """
    JobsActive4 model - jobs in the active state
    """

    class Meta:
        managed = False
        app_label = "job"
        db_table = f'"{settings.DB_SCHEMAS["panda"]}"."jobsactive4"'


class JobsArchived4(JobBaseModel):
    """
    JobsArchived4 model - jobs in their final state that have been archived from the active table, typically younger than 4 days.
    """

    class Meta:
        managed = False
        app_label = "job"
        db_table = f'"{settings.DB_SCHEMAS["panda"]}"."jobsarchived4"'
