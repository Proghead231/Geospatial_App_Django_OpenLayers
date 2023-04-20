from django import forms

class ShapefileForm(forms.Form):
    zipfile = forms.FileField()