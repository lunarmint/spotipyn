from django.urls import path

from api.views import PinView

urlpatterns = [
    path("", PinView.as_view()),
]
