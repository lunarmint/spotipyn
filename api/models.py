from django.db import models


class Pins(models.Model):
    user_id = models.BigIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    value = models.JSONField()
    end_time = models.DateTimeField()
    sent = models.BooleanField(default=False)

    def __str__(self):
        return {
            "user_id": self.user_id,
            "timestamp": self.timestamp,
            "value": self.value,
            "end_time": self.end_time,
            "sent": self.sent,
        }
