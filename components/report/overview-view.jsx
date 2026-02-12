"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge, CustomBarChart, CustomPieChart } from "./charts";
import { Badge } from "@/components/ui/badge";

export function OverviewView({ data }) {
    if (!data) return null;

    const { final_score, component_scores, weights_used, summary, risk_label } = data;

    // Backend provides 0-1, UI expects 0-100
    const scaledFinalScore = (final_score <= 1 && final_score > 0) ? final_score * 100 : final_score;

    // Prepare Chart Data
    const componentData = component_scores
        ? Object.entries(component_scores).map(([key, value]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            score: (value <= 1 && value > 0) ? value * 100 : value,
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
            <Card className="bg-transparent border-border">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-foreground">
                        Executive Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="shrink-0">
                            <ScoreGauge score={scaledFinalScore} />
                        </div>
                        <div className="space-y-4 flex-1">
                            <p className="text-muted-foreground leading-relaxed">
                                {typeof summary === 'string'
                                    ? (summary || "No summary available for this evaluation.")
                                    : (summary && typeof summary === 'object')
                                        ? (summary.agents_failed > 0
                                            ? `Evaluation complete with ${summary.agents_failed} agent errors. Final Score: ${Math.round(scaledFinalScore)}%`
                                            : `Evaluation complete. The investment readiness score is ${Math.round(scaledFinalScore)}% based on multispectral analysis.`)
                                        : "No summary available for this evaluation."
                                }
                            </p>
                            <div className="flex gap-2">
                                <Badge className={cn(
                                    "px-3 py-1",
                                    risk_label?.includes("LOW") ? "bg-green-500/20 text-green-400 border-green-500/20" :
                                        risk_label?.includes("MEDIUM") ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/20" :
                                            "bg-red-500/20 text-red-400 border-red-500/20"
                                )}>
                                    {risk_label?.replace('_', ' ') || "Calculated"} Risk Profile
                                </Badge>
                                <Badge variant="outline" className="text-muted-foreground border-border">
                                    {componentData.length} Analysis Domains
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Component Scores Chart */}
                <Card className="bg-transparent border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Domain Performance Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart data={componentData} xKey="name" yKey="score" color="#3b82f6" />
                    </CardContent>
                </Card>

                {/* Weights Chart */}
                <Card className="bg-transparent border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Scoring Dimension Weights</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomPieChart data={weightData} nameKey="name" valueKey="value" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

const cn = (...classes) => classes.filter(Boolean).join(' ');
