from fastapi import FastAPI

from backend.routes.search_route import router as research_router

app = FastAPI()

app.include_router(research_router)