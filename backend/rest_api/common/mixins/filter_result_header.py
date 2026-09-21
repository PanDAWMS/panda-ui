import json


class FilterMetadataHeaderMixin:
    """Mixin to append filter tracking metadata headers to responses."""

    filter_result = None

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)

        if getattr(self, "filter_result", None) and response.status_code == 200:
            response["X-Applied-Filters"] = json.dumps(self.filter_result.applied_params)
            response["X-Ignored-Filters"] = json.dumps(self.filter_result.ignored_params)

        return response
