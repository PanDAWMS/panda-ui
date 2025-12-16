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
        db_table = f'"{settings.DB_SCHEMAS['panda'] if settings.ENVIRONMENT != 'development' else settings.DB_SCHEMAS['pandaui']}"."error_descriptions"'
        unique_together = (("component", "code"),)
