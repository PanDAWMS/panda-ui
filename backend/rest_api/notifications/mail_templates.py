"""
HTML/plain-text templates for the lifecycle notification emails sent by
evaluate_notifications. Mirrors the look of the JEDI task-completion email
(panda-server/pandajedi/jedipprocess/MailTemplates.py) - same PanDA logo, table
styling, and problem-reporting footer - so subscribers see a consistent PanDA brand
across both notification systems, while the wording makes clear this is a different,
opt-in subscription notification rather than the automatic per-task completion email.
"""

html_head = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }}
        th, td {{
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
        }}
        th {{
            background-color: #f2f2f2;
        }}
        .logo {{
            width: 100px;
        }}
    </style>
    <title>{title}</title>
</head>
"""

notification_html_body = """
<body>
    <img class="logo" src="https://panda-wms.readthedocs.io/en/latest/_static/PanDA-rev-logo-small-200px.jpg" alt="PanDA Logo">
    <h2>Subscription notification for TaskID: <a href="{task_url}">{jeditaskid}</a></h2>
    <p>{message}</p>
    {status_table}
    <p><a href="{task_url}">View this task on panda-ui</a></p>
    <p style="color: #666666; font-size: 0.9em;">You're receiving this because you subscribed to notifications for this task on panda-ui. This is separate from the automatic "task finished" email JEDI sends for ATLAS analysis tasks.</p>

    <h3>Panda Problem Reporting</h3>
    <ul>
        <li>The eGroup for help request: <a href="mailto:hn-atlas-dist-analysis-help@cern.ch">hn-atlas-dist-analysis-help@cern.ch</a></li>
        <li>The Discourse forum for distributed computing help: <a href="https://atlas-talk.web.cern.ch/c/distributed-computing-help">https://atlas-talk.web.cern.ch/c/distributed-computing-help</a></li>
        <li>The JIRA portal for software bug: <a href="https://its.cern.ch/jira/browse/ATLASPANDA">https://its.cern.ch/jira/browse/ATLASPANDA</a></li>
    </ul>
</body>
</html>
"""

status_table_html = """
    <h3>Current Job Status</h3>
    <table>
        <tr>
            <th>Status</th>
            <th>Count</th>
        </tr>
        {rows}
    </table>
"""

status_table_row_html = """
        <tr>
            <td>{status}</td>
            <td>{count}</td>
        </tr>
"""


def render_notification_email(jeditaskid, task_url, message, status_counts=None):
    """Returns (html_body, title) for a lifecycle notification email."""
    title = f"Task notification for TaskID: {jeditaskid}"
    status_table = ""
    if status_counts:
        rows = "".join(status_table_row_html.format(status=status, count=count) for status, count in sorted(status_counts.items()))
        status_table = status_table_html.format(rows=rows)
    body = notification_html_body.format(
        jeditaskid=jeditaskid,
        task_url=task_url,
        message=message,
        status_table=status_table,
    )
    return html_head.format(title=title) + body
