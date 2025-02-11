from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Test, Result, TypingTestText

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('avatar',)}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Test)
admin.site.register(Result)
admin.site.register(TypingTestText)
