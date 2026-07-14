"""
VO specific settings, can be used to override default settings for a specific VO.
"""

import os

VO = os.getenv("PANDAUI_VO", None).upper()
if VO is None:
    raise ValueError("Environment variable 'PANDAUI_VO' is not set.")

raw_apps = os.getenv("PANDAUI_INSTALLED_APPS", "").split(",")
INSTALLED_APPS_VO = [app.strip() for app in raw_apps if app.strip()]
