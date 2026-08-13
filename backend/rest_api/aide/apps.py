"""Apps.py for the OAuth application."""

from django.apps import AppConfig


class AideConfig(AppConfig):
    """Django AppConfig for the Aide application."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "rest_api.aide"
