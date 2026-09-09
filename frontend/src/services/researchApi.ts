import type { ResearchResponse } from "../types/research";

const API_URL = "http://localhost:8000";

export async function researchQuery(
    query: string
): Promise<ResearchResponse> {
    const response = await fetch(`${API_URL}/research`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
    });
    return response.json();
}