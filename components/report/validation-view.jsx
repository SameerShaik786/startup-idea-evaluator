"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { CustomBarChart } from "./charts";

export function ValidationView({ data }) {
    if (!data?.agent_results?.validator) return <div className="p-4 text-gray-400">Data not available</div>;

    const validation = data.agent_results.validator;
    const { consistency_score, completeness_score, flags, sentiment } = validation;

    const chartData = [
        { name: "Consistency", score: consistency_score },
        { name: "Completeness", score: completeness_score },
        { name: "Sentiment", score: sentiment === "positive" ? 80 : sentiment === "neutral" ? 50 : 20 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
                <ScoreCard title="Consistency Score" score={consistency_score} />
                <ScoreCard title="Completeness Score" score={completeness_score} />
                <ScoreCard title="Confidence Level" score={(consistency_score + completeness_score) / 2} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-[#202020] border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">Validation Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart data={chartData} xKey="name" yKey="score" color="#10b981" />
                    </CardContent>
                </Card>

                <Card className="bg-[#202020] border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">Suspicion Flags</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {flags && flags.length > 0 ? (
                            <div className="space-y-3">
                                {flags.map((flag, i) => (
                                    <Alert key={i} variant="destructive" className="bg-red-900/10 border-red-900/50">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Flag Detected</AlertTitle>
                                        <AlertDescription>{flag}</AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-green-500 space-y-2 py-8">
                                <CheckCircle2 className="h-12 w-12" />
                                <p>No suspicion flags detected.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ScoreCard({ title, score }) {
    return (
        <Card className="bg-[#202020] border-gray-800">
            <CardContent className="pt-6">
                <div className="text-sm font-medium text-gray-400">{title}</div>
                <div className="text-3xl font-bold text-white mt-2">{Math.round(score)}/100</div>
            </CardContent>
        </Card>
    );
}
