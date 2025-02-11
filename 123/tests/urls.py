from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (RegisterView, UserView, ChangePasswordView,
                    TestListView, TestDetailView, ResultListView,
                    ResultDetailView, GlobalTopResultsView,
                    TypingTestTextListView, TypingTestTextDetailView,
                    LeaderboardView, UserLogin, results_view)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', UserLogin.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', UserView.as_view(), name='user'),
    path('user/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('tests/', TestListView.as_view(), name='test-list'),
    path('tests/<int:pk>/', TestDetailView.as_view(), name='test-detail'),
    path('results/', ResultListView.as_view(), name='result-list'),
    path('results1/', results_view, name='results'),
    path('results/<int:pk>/', ResultDetailView.as_view(), name='result-detail'),
    path('results/global/', GlobalTopResultsView.as_view(), name='global-top-results'),
    path('texts/', TypingTestTextListView.as_view(), name='text-list'),
    path('texts/<int:pk>/', TypingTestTextDetailView.as_view(), name='text-detail'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]