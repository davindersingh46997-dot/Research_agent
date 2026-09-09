import { useState } from "react";
import { useResearch } from "../hooks/useResearch";
import type { ResearchResponse } from "../types/research";

function ResearchStep({
    text,
    active = false,
}: {
    text: string;
    active?: boolean;
}) {
    return (
        <div
            className={`flex items-center gap-3 rounded-lg p-3 ${
                active ? "bg-gray-100" : "opacity-40"
            }`}
        >
            <div className="h-2 w-2 rounded-full bg-current" />

            <span>{text}</span>
        </div>
    );
}

function ResearchResult({
    result,
}: {
    result: ResearchResponse;
}) {
    return (
        <div className="mx-auto max-w-4xl space-y-8">

            {/* Query */}
            <div>
                <p className="text-sm text-gray-500">
                    Research question
                </p>

                <h2 className="text-2xl font-semibold">
                    {result.query}
                </h2>
            </div>

            {/* Report */}
            <section>
                <h3 className="mb-3 text-xl font-semibold">
                    Research Report
                </h3>

                <div className="whitespace-pre-wrap leading-7">
                    {result.report}
                </div>
            </section>

            {/* Claims */}
            <section>
                <h3 className="mb-4 text-xl font-semibold">
                    Verified Claims
                </h3>

                <div className="space-y-4">
                    {result.claims.map((claim, index) => (
                        <div
                            key={index}
                            className="rounded-xl border p-4"
                        >
                            <p className="font-medium">
                                {claim.claim}
                            </p>

                            <div className="mt-3 flex gap-3 text-sm">
                                <span>
                                    {claim.status}
                                </span>

                                <span>
                                    {Math.round(
                                        claim.confidence * 100
                                    )}
                                    % confidence
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Research gaps */}
            <section>
                <h3 className="mb-3 text-xl font-semibold">
                    Research Gaps
                </h3>

                <ul className="list-disc space-y-2 pl-5">
                    {result.research_gaps.map(
                        (gap, index) => (
                            <li key={index}>
                                {gap}
                            </li>
                        )
                    )}
                </ul>
            </section>

        </div>
    );
}

export default function ChatWindow() {

    const [query, setQuery] = useState("");

    const {
        research,
        result,
        loading,
        error
    } = useResearch();

    const handleSubmit = async () => {

        if (!query.trim() || loading) {
            return;
        }

        await research(query);

        setQuery("");
    };

    return (
        <div className="flex h-full flex-col">

            {/* Header */}

            <div className="border-b p-4">
                <h1 className="text-xl font-semibold">
                    Research Agent
                </h1>

                <p className="text-sm text-gray-500">
                    Evidence-first research
                </p>
            </div>


            {/* Research Area */}

            <div className="flex-1 overflow-y-auto p-6">

                {!result && !loading && (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold">
                                What do you want to research?
                            </h2>

                            <p className="mt-2 text-gray-500">
                                Ask a question and I'll investigate it.
                            </p>
                        </div>
                    </div>
                )}


                {/* Loading */}

                {loading && (
                    <div className="space-y-3">

                        <ResearchStep
                            text="Searching the web..."
                            active
                        />

                        <ResearchStep
                            text="Extracting claims..."
                        />

                        <ResearchStep
                            text="Verifying evidence..."
                        />

                        <ResearchStep
                            text="Generating report..."
                        />

                    </div>
                )}


                {/* Result */}

                {result && !loading && (
                    <ResearchResult result={result} />
                )}


                {/* Error */}

                {error && (
                    <div className="rounded-lg border border-red-300 p-4 text-red-600">
                        {error}
                    </div>
                )}

            </div>


            {/* Input */}

            <div className="border-t p-4">

                <div className="flex gap-2">

                    <input
                        value={query}
                        onChange={(e) =>
                            setQuery(e.target.value)
                        }
                        onKeyDown={(e) => {

                            if (e.key === "Enter") {
                                handleSubmit();
                            }

                        }}
                        placeholder="What do you want to research?"
                        className="flex-1 rounded-lg border px-4 py-3 outline-none"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-lg px-5 py-3 text-white bg-black disabled:opacity-50"
                    >
                        {loading ? "Researching..." : "Research"}
                    </button>

                </div>

            </div>

        </div>
    );
}