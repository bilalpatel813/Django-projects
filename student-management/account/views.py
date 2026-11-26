from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response 
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.views import APIView
from .models import User
from .serializers import *
# Create your views here.
class RegisterAPI(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes=[IsAuthenticated]
    serializer_class=RegisterSerializer
    def create(self, request, args, **kwargs):
        serializer = self,get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user= serializer.save()
        refresh  = RefreshToken.for_user(user)
        print(seiralizer.data)
        return Response({
            "user":{
                "id":serializer.data.get("id"),
                "full_name":serializer.data.get("full_name"),
                "email":serializer.data.get("email")},
                "refresh":str(refresh), 
                "access":st(refresh.access_token)
            }, status=201)

class LoginAPI(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)
            user_data=UserSerializer(user).data
            return Response({
                "user":user_data, 
                "refresh":str(refresh),
                "access":str(refresh.access_token),
                "message":"Login Successfull"
            }, status=status.HTTP_200_OK)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
class LogoutAPI(APIView):
    permission_classes=[IsAuthenticated]
    def post(self, request):
        try:
            token=RefreshToken(request.data["refresh"])
            token.blacklist()
            return Response(
                {"message":"Logged out successfully"}, 
                status=status.HTTP_205_RESET_CONTENT
            )
        except TokenError:
            return Resposne(
                {"message":"Token is invalid or already bloacked" },
                status=status.HTTP_400_BAD_REQUEST)

class Me(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class ProfileAPI(generics.RetrieveUpdateAPIView):
    serializer_class=UserSerializer
    permission_classes=[IsAuthenticated]

    def get_object(self):
        return self.request.user
