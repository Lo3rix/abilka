from rest_framework import serializers
from .models import CustomUser, Test, Result, TypingTestText

class CustomUserSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'avatar', 'created_at', 'updated_at', 'password', 'current_password', 'last_login')
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'email': {'required': False},
        }

    def create(self, validated_data):
        try:
            user = CustomUser(
                username=validated_data['username'],
                email=validated_data['email'],
                avatar=validated_data.get('avatar')
            )
            user.set_password(validated_data['password'])
            user.save()
            return user
        except Exception as e:
            raise serializers.ValidationError({'detail': str(e)})

    def update(self, instance, validated_data):
        current_password = validated_data.pop('current_password', None)

        if 'email' in validated_data:
            if current_password is None:
                raise serializers.ValidationError({'current_password': 'Current password is required to change email.'})
            if not instance.check_password(current_password):
                raise serializers.ValidationError({'current_password': 'Current password is incorrect.'})
            instance.email = validated_data.get('email', instance.email)

        instance.username = validated_data.get('username', instance.username)

        if 'avatar' in validated_data:
            instance.avatar = validated_data['avatar']

        if 'password' in validated_data:
            instance.set_password(validated_data['password'])

        instance.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = ('id', 'title', 'description')

class ResultSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = Result
        fields = ('id', 'test', 'user', 'score', 'average_time', 'created_at')

class TypingTestTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypingTestText
        fields = '__all__'

class LeaderboardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    avatar = serializers.ImageField(source='user.avatar')

    class Meta:
        model = Result
        fields = ('username', 'avatar', 'score', 'average_time', 'attempt_count', 'created_at')