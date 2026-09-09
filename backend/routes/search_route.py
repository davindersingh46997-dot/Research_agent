from fastapi import APIRouter
from backend.schemas.search import SearchRequest

router = APIRouter(
    prefix="/api/research",
    tags=["Research"]
)

@router.post("/extract")
async def extract_research(request: SearchRequest):

    """
    extracting route for the research extraction agent. It takes a search query and returns factual claims with their supporting evidence.
    """
    from backend.Research.extractor import extract_model

    result = extract_model(request.query)

    return {
        "query": request.query,
        "results": result
    }

    