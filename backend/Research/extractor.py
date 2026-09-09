from langchain.agents import create_agent
from backend.Research.Tavily import search_web


agent = create_agent(
    model="huggingface:microsoft/Phi-3-mini-4k-instruct",
    tools=[search_web],
    system_prompt="""
    You are a research extraction agent.

    The user will provide a research query.

    Use the web search tool to find relevant information.
    From the search results, extract factual claims that are
    directly supported by the retrieved sources.

    Do not add information from your own knowledge.
    Do not assume that a claim is true merely because it appears
    in a search result.

    Return:
    - claim
    - source URL
    - supporting evidence
    """
)


def extract_model(query: str):
    """
    Search the web and extract factual claims with their evidence.
    """

    result = agent.invoke({
        "messages": [
            {
                "role": "user",
                "content": query
            }
        ]
    })

    return result