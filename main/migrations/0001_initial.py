# Generated by Django 4.1.7 on 2023-04-05 12:23

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Files',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_id', models.CharField(max_length=255, null=True)),
                ('name', models.CharField(default='Unnamed_GeoJSON', max_length=255)),
                ('geojson', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
