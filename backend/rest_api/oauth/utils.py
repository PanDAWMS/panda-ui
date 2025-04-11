import logging
from django.contrib.auth.models import User, Group
_logger = logging.getLogger('oauth')


def preserve_cookies(request, response):
    """
    Copy cookies from the request to the response for redirect to frontend.
    :param request: The HTTP request object.
    :param response: The HTTP response object.
    return: The modified response object with copied cookies.
    """
    # Copy cookies from the request to the response
    for cookie in request.COOKIES:
        if cookie in ["csrftoken", "sessionid"]:
            response.set_cookie(cookie, request.COOKIES[cookie], httponly=False, secure=False, samesite='Lax')
    # Set the token in cookies
    if request.user.is_authenticated and 'pandauitoken' not in response.cookies:
        response.set_cookie('pandauitoken', request.user.auth_token.key, httponly=True, secure=False, samesite='Strict')
    return response


def update_user_groups(email, user_groups):
    """
    Add user groups to the user in Django based on the email and user groups from IAM.
    :param email: str
    :param user_groups: list of str, user groups set in IAM
    :return: bool
    """
    # get user objects by email
    users = User.objects.filter(email=email)
    if not users.exists() or len(users) == 0:
        _logger.error(f'There is no user with this email {email}')
        return False

    # add new groups to users
    for group in user_groups:
        if not Group.objects.filter(name=group).exists():
            group_object = Group.objects.create(name=group)
            group_object.save()
        for user in users:
            if not user.groups.filter(name=group).exists():
                user.groups.add(Group.objects.get(name=group))
                user.save()
    return True

