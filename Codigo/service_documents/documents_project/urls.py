from django.urls import path
from . import views

urlpatterns = [
    path('virtualize/', views.parse_business_quote, name='parse_quote'),
]