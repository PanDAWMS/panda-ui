import logging

from django.db.models.signals import post_migrate
from django.db.utils import OperationalError, ProgrammingError
from django.dispatch import receiver

_logger = logging.getLogger("general_error")


@receiver(post_migrate)
def create_global_permission(sender, **kwargs):
    # set up necessary permissions
    try:
        from django.contrib.auth.models import Permission
        from django.contrib.contenttypes.models import ContentType

        content_type, _ = ContentType.objects.get_or_create(app_label="rest_api", model="globalpermission")

        Permission.objects.get_or_create(
            codename="can_see_experiment_data",
            name="Can see experiment data",
            content_type=content_type,
        )
    except (OperationalError, ProgrammingError) as e:
        _logger.warning(f"Failed to set up permissions {str(e)}")
