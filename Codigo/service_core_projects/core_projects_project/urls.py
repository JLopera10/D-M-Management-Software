from django.contrib import admin
from django.urls import path
from django.http import JsonResponse

# ITS JUST AN EXAMPLE TO SHOW THE STRUCTURE AND THE WAY THIS WILL COMMUNICATE WITH THE FRONTEND, WE HAVE TO REPLACE IT WITH THE ACTUAL CODE
def dummy_projects_view(request):
    return JsonResponse({
        "status": "success",
        "service": "CORE PROJECTS",
        "message": "Hello! The Projects endpoint is alive and well.",
        "data": [
            {"id": 1, "title": "University Web Solution", "status": "In Progress"},
            {"id": 2, "title": "Database Migration", "status": "Pending"}
        ]
    })

def dummy_tasks_view(request):
    return JsonResponse({
        "status": "success",
        "service": "CORE PROJECTS",
        "message": "Tasks endpoint is responding!",
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('projects/', dummy_projects_view),
    path('tasks/', dummy_tasks_view),
]