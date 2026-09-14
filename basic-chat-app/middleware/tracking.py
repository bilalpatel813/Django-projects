class TrackUserMiddleware:
  def __init__(self,get_response):
    self.get_response = get_response

  def __call__(self,request):
    # print("User:",request.user)
    # print("Path:",request.path)
    # print("method:",request.method)
    response = self.get_response(request)
    print("User:",request.user)
    print("Path:",request.path)
    print("method:",request.method)

    return response 