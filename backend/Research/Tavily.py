import os
from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

client = TavilyClient(
    api_key=os.getenv("TAVILY_API_KEY")
)


def search_web(query: str, max_results: int = 5):

    response = client.search(
        query=query,
        search_depth="advanced",
        max_results=max_results,
        include_answer=True
    )

    sources = []

    for result in response.get("results", []):

        sources.append({
            "title": result.get("title"),
            "url": result.get("url"),
            "content": result.get("content"),
            "score": result.get("score")
        })

    return {
        "answer": response.get("answer"),
        "sources": sources
    }