# Generated by Django 4.2.13 on 2024-06-12 14:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tests', '0004_rename_average_time_try_time'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Try',
        ),
    ]
