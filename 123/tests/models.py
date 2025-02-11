from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username

class Test(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.title

class Result(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    average_time = models.FloatField()
    score = models.PositiveIntegerField(default=1)
    attempt_count = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.test.title} - {self.average_time}ms ({self.attempt_count} попыток)"

class TypingTestText(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, null=True, blank=True)
    text = models.TextField()

    def __str__(self):
        return f'Text {self.id}'