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
    Base model for job-related models
    """

    pandaid = models.BigIntegerField(db_column="pandaid", blank=False, null=False, primary_key=True)
    creationtime = models.DateTimeField(db_column="creationtime", blank=False, null=False)
    computingsite = models.CharField(max_length=32, db_column="computingsite", blank=True, null=True)
    username = models.CharField(max_length=64, db_column="produsername", blank=True, null=True)
    jobstatus = models.CharField(max_length=16, db_column="jobstatus", blank=True, null=True)

    class Meta:
        abstract = True


class JobsActive4(JobBaseModel):
    """
    JobsActive4 model
    """

    class Meta:
        managed = False
        app_label = "job"
        db_table = f'"{settings.DB_SCHEMAS["panda"]}"."jobsactive4"'


class JobsArchived4(JobBaseModel):
    """
    JobsArchived4 model - jobs that have been archived from the active table, typically younger than 4 days.
    """

    class Meta:
        managed = False
        app_label = "job"
        db_table = f'"{settings.DB_SCHEMAS["panda"]}"."jobsarchived4"'
