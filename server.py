"""
Vercel serverless entrypoint at repo root.
Implementation lives in backend/server.py; path fix is required so `backend` resolves on Vercel.
"""
import sys
from pathlib import Path

_root = Path(__file__).resolve().parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from backend.server import app  # noqa: E402, F401
