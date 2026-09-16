import time
import logging

logger = logging.getLogger("blog.timing")


class RequestTimingMiddleware:
    """Logs how long each request took to process."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration = time.time() - start
        logger.info("%s %s took %.3fs", request.method, request.path, duration)
        return response
