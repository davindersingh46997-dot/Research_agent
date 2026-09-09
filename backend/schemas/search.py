from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    max_results: int = Field(default=5, ge=1, le=20)


class SearchResult(BaseModel):
    title: str
    url: str
    content: str


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]