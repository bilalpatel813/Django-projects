from rest_framework.permissions import BasePermission

class IsAuthor(BasePermission):
    def has_object_permission(self,request,view,obj):
        if request.method in ['GET','OPTIONS','HEAD']:
           return True
        return obj.author == request.user    
            
            