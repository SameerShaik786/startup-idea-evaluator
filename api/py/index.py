from backend.main import app  # noqa: F401

# Vercel expects a variable named `app` or `handler`
# FastAPI/Starlette apps are ASGI-compatible and work directly with @vercel/python
