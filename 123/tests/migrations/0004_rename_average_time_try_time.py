# Generated by Django 4.2.13 on 2024-06-12 13:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tests', '0003_try_average_time'),
    ]

    operations = [
        migrations.RenameField(
            model_name='try',
            old_name='average_time',
            new_name='time',
        ),
    ]
