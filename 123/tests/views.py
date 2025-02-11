from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from rest_framework import generics, permissions, status, serializers, viewsets
from django.utils import timezone
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.timezone import now, timedelta
from django.contrib.auth import update_session_auth_hash
from rest_framework_simplejwt.views import TokenObtainPairView
from django.template.loader import render_to_string

from .models import CustomUser, Test, Result, TypingTestText
from .serializers import (CustomUserSerializer, TestSerializer, ResultSerializer,
                          ChangePasswordSerializer, TypingTestTextSerializer, LeaderboardSerializer, UserProfileSerializer)
from .pagination import CustomPagination

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            except Exception as e:
                print(f"Error during user creation: {str(e)}")
                return Response({"detail": f"User creation failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CustomUserSerializer

    def get_object(self):
        return self.request.user

class UserLogin(TokenObtainPairView):
    serializers_class = CustomUserSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        try:
            response = super().post(request, *args, **kwargs)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        return response

class ChangePasswordView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            if not self.object.check_password(serializer.data.get("current_password")):
                return Response({"current_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)

            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            update_session_auth_hash(request, self.object)

            return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TestListView(generics.ListAPIView):
    queryset = Test.objects.all().order_by('id')
    serializer_class = TestSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = CustomPagination

class TestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [permissions.IsAuthenticated]

class ResultListView(generics.ListCreateAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        test_id = self.request.query_params.get('test')
        score = self.request.query_params.get('score')
        if test_id:
            queryset = queryset.filter(test_id=test_id, user=self.request.user)
        if score:
            queryset = queryset.filter(score=score)
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_authenticated:
            try:
                test = Test.objects.get(pk=self.request.data['test'])
                score = self.request.data.get('score', 1)
                average_time = self.request.data['average_time']
                attempt_count = self.request.data.get('attempt_count', 1)
                serializer.save(user=user, test=test, score=score, average_time=average_time, attempt_count=attempt_count)
            except Test.DoesNotExist:
                raise serializers.ValidationError("Invalid test ID.")
        else:
            pass

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        test_id = request.query_params.get('test')
        attempt_count = request.query_params.get('attempt_count')
        if not test_id:
            return Response({'detail': 'Test ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        queryset = self.get_queryset().filter(user=request.user, test_id=test_id)
        if attempt_count:
            queryset = queryset.filter(attempt_count=attempt_count)
        count, _ = queryset.delete()
        return Response({'detail': f'{count} results deleted.'}, status=status.HTTP_204_NO_CONTENT)

class ResultDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [permissions.IsAuthenticated]

class GlobalTopResultsView(generics.ListAPIView):
    serializer_class = ResultSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = CustomPagination

    def get_queryset(self):
        test_id = self.request.query_params.get('test')
        score = self.request.query_params.get('score')
        if test_id == '2':
            queryset = Result.objects.filter(test_id=test_id).order_by('-score')
        elif test_id == '3':
            queryset = Result.objects.filter(test_id=test_id).order_by('-score')
        else:
            queryset = Result.objects.filter(test_id=test_id).order_by('average_time')
            if score:
                queryset = queryset.filter(score=score)
        return queryset

class TypingTestTextListView(generics.ListCreateAPIView):
    queryset = TypingTestText.objects.all()
    serializer_class = TypingTestTextSerializer
    permission_classes = [permissions.AllowAny]

class TypingTestTextDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TypingTestText.objects.all()
    serializer_class = TypingTestTextSerializer
    permission_classes = [permissions.AllowAny]

class LeaderboardView(generics.GenericAPIView):
    serializer_class = LeaderboardSerializer
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        leaderboard = {}
        week_ago = now() - timedelta(days=7)

        attempt_count = request.query_params.get('attempt_count')

        tests = Test.objects.all()

        for test in tests:
            top_results = Result.objects.filter(
                test=test,
                created_at__gte=week_ago
            )

            if attempt_count:
                top_results = top_results.filter(attempt_count=attempt_count)

            top_results = top_results.order_by('-score')[:5]

            serializer = self.get_serializer(top_results, many=True)
            leaderboard[test.title] = serializer.data

        return Response(leaderboard)

def results_view(request):
    results = Result.objects.all().order_by('-created_at')
    return render(request, 'index.html', {'results': results})