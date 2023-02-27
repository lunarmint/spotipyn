from rest_framework import generics

from api.models import Pins
from api.serializer import PinSerializer


class PinView(generics.ListCreateAPIView):
    queryset = Pins.objects.all()
    serializer_class = PinSerializer
