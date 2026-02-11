"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge, CustomBarChart, CustomPieChart } from "./charts";
import { Badge } from "@/components/ui/badge";

export function OverviewView({ data }) {
    if (!data) return null;

    const { final_score, component_scores, weights_used, summary, risk_label } = data;

    // Prepare Chart Data
    const componentData = component_scores
        ? Object.entries(component_scores).map(([key, value]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            score: value,
        }))
        : [];

    const weightData = weights_used
        ? Object.entries(weights_used).map(([key, value]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: value * 100,
        }))
        : [];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Summary Card */}
            <Card className="bg-[#202020] border-gray-800">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-white">
                        Executive Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="shrink-0">
                            <ScoreGauge score={final_score} />
                        </div>
                        <div className="space-y-4 flex-1">
                            <p className="text-gray-300 leading-relaxed">
                                {summary || "No summary available for this evaluation."}
                            </p>
                            <div className="flex gap-2">
                                <Badge variant={risk_label === "Low" ? "success" : "destructive"}>
                                    {risk_label} Risk Profile
                                </Badge>
                                <Badge variant="outline">
                                    {componentData.length} Components Analyzed
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Component Scores Chart */}
                <Card className="bg-[#202020] border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">Component Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart data={componentData} xKey="name" yKey="score" />
                    </CardContent>
                </Card>

                {/* Weights Chart */}
                <Card className="bg-[#202020] border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">Scoring Weights</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomPieChart data={weightData} nameKey="name" valueKey="value" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
