# Generated by Django 4.2.13 on 2024-06-18 04:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tests', '0009_typingtesttext_test'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='typingtesttext',
            name='test',
        ),
    ]
