# Generated by Django 4.1.7 on 2023-02-25 20:08

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Pins",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("user_id", models.BigIntegerField()),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                ("value", models.JSONField()),
                ("end_time", models.DateTimeField()),
                ("sent", models.BooleanField(default=False)),
            ],
        ),
    ]
