"""
Custom middleware for header-based session management.
"""
from django.contrib.sessions.middleware import SessionMiddleware

class HeaderSessionMiddleware(SessionMiddleware):
    """
    Middleware that reads the session ID from the 'X-Session-ID' header
    instead of (or in addition to) cookies.
    """
    def process_request(self, request):
        # Try to get session key from header
        session_key = request.headers.get('X-Session-ID')
        
        if session_key:
            request.session_engine = __import__(self.SessionStore.__module__, {}, {}, ['SessionStore'])
            request.session = self.SessionStore(session_key)
        else:
            # Fallback to default behavior (cookies)
            super().process_request(request)
