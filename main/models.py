from django.db import models


class Files(models.Model):
    user_id = models.CharField(max_length=255, null=True)
    name = models.CharField(max_length=255, default="Unnamed_GeoJSON")
    geojson = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.user_id}- {self.name}"

