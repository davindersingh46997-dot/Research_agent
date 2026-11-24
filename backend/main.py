from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.chat import router as chat_router

app = FastAPI(
    title="Research Agent API",
    description="Backend API for autonomous evidence-grounded research powered by OpenRouter and LangGraph.",
    version="1.0.0",
)

# Enable CORS for local dev and cross-origin client apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
