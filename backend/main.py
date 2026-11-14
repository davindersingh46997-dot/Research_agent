from fastapi import FastAPI

from backend.api.chat import router as chat_router

app = FastAPI(title="Research Agent API")
app.include_router(chat_router)