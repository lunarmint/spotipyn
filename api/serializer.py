from rest_framework import serializers

from .models import Pins


class PinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pins
        fields = "__all__"
