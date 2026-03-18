from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
import json

# ITS JUST AN EXAMPLE TO SHOW THE STRUCTURE AND THE WAY THIS WILL COMMUNICATE WITH THE FRONTEND, WE HAVE TO REPLACE IT WITH THE ACTUAL CODE
def dummy_login_view(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            username = body.get('username', 'Unknown')
            
            return JsonResponse({
                "status": "success",
                "message": f"Welcome {username}! This is a fake login token.",
                "access": "FAKE_JWT_TOKEN_123456789",
                "refresh": "FAKE_REFRESH_TOKEN_987654321"
            })
        except:
            pass
            
    # If it's just a regular GET request
    return JsonResponse({
        "status": "info",
        "message": "Hit this endpoint with a POST request to log in."
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', dummy_login_view), 
]