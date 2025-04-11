from django.urls import path, include
import rest_api.oauth.views as oauth_views

urlpatterns = [
    path('', include('social_django.urls', namespace='social')),
    path('redirect_after_login/', oauth_views.redirect_after_login_view, name='redirect_after_login'),
    path('logout/', oauth_views.logout_view, name='logout'),
    path('userinfo/', oauth_views.UserInfo.as_view(), name='user_info'),
    path('usertoken/', oauth_views.UserToken.as_view(), name='user_token'),
]