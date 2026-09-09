export interface Source {
    title: string;
    url : string;
    content : string;
}

export interface Claim {
    claim : string;
    status: "SUPPORTED" | "PARTIALLY_SUPPORTED" | "CONTRADICTED" | "UNCERTAIN";
    confidence: number;
    sources: Source[];
}

export interface ResearchResponse {
    query : string;
    claims : Claim[];
    research_gaps : string[];
    report : string;
}