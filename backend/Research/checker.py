from backend.Research.Tavily import search_web
from langchain.agents import create_agent

verification_agent = create_agent(
    model="huggingface:microsoft/Phi-3-mini-4k-instruct",
    tools=[search_web],
    system_prompt="""
    You are a research verification agent.

    Your job is to verify claims extracted from an initial
    research process.

    For each claim:

    1. Determine whether the existing evidence is sufficient.
    2. If verification is needed, formulate a targeted search query.
    3. Use the search_web tool to find independent evidence.
    4. Compare the new evidence with the original claim.
    5. Classify the claim as:
       - SUPPORTED
       - CONTRADICTED
       - PARTIALLY_SUPPORTED
       - UNCERTAIN

    Do not blindly trust the original research.
    Actively look for contradictory evidence.
    """
)


def verify_claims(claims_with_evidence : dict):
    """
    Verify the extracted claims using independent evidence.
    """

    result = verification_agent.invoke({
        "messages": [
            {
                "role": "user",
                "content": claims_with_evidence
            }
        ]
    })

    return result