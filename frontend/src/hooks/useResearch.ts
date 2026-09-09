import { useState } from "react";
import { researchQuery } from "../services/researchApi";
import type { ResearchResponse } from "../types/research";

export function useResearch() {

    const [result, setResult] =
        useState<ResearchResponse | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const research = async (query: string) => {

        setLoading(true);
        setError(null);

        try {

            const data = await researchQuery(query);

            setResult(data);

            return data;

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong"
            );

            return null;

        } finally {

            setLoading(false);

        }
    };

    return {
        research,
        result,
        loading,
        error,
    };
}