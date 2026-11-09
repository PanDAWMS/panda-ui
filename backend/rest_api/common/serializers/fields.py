import json

from rest_framework import serializers


class ParsedJsonField(serializers.Field):
    """Custom field to automatically parse a JSON string into a Python dict/list"""

    def to_representation(self, value):
        """Converts value of a text field to Python dict if it is a JSON string, otherwise returns string"""
        if not value:
            return {}
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return value

    def to_internal_value(self, data):
        """Converts Python dict back to string if saving/updating is needed"""
        return json.dumps(data)
