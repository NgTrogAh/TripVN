import os

ENV = os.getenv("ENV", "local")
DEBUG = ENV != "production"

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")

WHISPER_MODEL = os.getenv("WHISPER_MODEL", "tiny")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:4000")

HTTP_TIMEOUT = int(os.getenv("HTTP_TIMEOUT", "90"))
