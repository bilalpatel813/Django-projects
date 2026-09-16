from setuptools.build_meta import get_requires_for_build_sdist
import time
class SimpleMiddleWare:
    def __init__(self,get_response):
        self.get_response=get_response
    def __call__(self,request):
        print('before view',request.path)
        Start=time.time()
        response=self.get_response(request)
        End=time.time()
        print('after view',request.path)
        print('overall time taken:',Start - End)
        return response

class UserTrackingMiddleware:
  def __init__(self,get_response):
    self.get_response = get_response
  def __call__(self,request):
    response =  get_response(request)
    print("User",request.user)
    print("path",request.path)
    return response 
        
        