from django.shortcuts import render
from django.views.generic import CreateView
from django.urls import reverse_lazy
from django.contrib.auth.models import User
from accounts.forms import CustomSignUp
from django.contrib.auth import login
# Create your views here.

class CreateCredential(CreateView):
    form_class=CustomSignUp
    template_name='accounts/create_credential.html'
    success_url=reverse_lazy('home')
    def form_valid(self, form):
        print("form valid")
        response =super().form_valid(form)
        login(self.request, self.object)
        return response
    