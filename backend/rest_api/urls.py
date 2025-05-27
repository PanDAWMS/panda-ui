"""
URL configuration for rest_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from django.conf import settings

from rest_framework.schemas import get_schema_view
from rest_framework.renderers import JSONOpenAPIRenderer

schema_view = get_schema_view(
    title="Server Monitoring API",
    url="https://bigpanda.cern.ch/api/",
    renderer_classes=[JSONOpenAPIRenderer],
)

urlpatterns = [path("schema.json", schema_view),]

for app in settings.INSTALLED_APPS:
    if app.startswith("rest_api."):
        urlpatterns.append(path(f"api/{app.replace('rest_api.', '')}/", include(f'{app}.urls')))