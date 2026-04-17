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
        
        