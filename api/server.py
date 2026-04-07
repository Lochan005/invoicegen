"""
Vercel Python entry: must live under `api/` so @vercel/python installs requirements
next to the handler. Public URL is still /invoice-api/* (see vercel.json routes).
"""
import sys
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from backend.server import app  # noqa: E402, F401
