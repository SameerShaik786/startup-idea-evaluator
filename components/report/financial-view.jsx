"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomBarChart, ScoreGauge } from "./charts";
import { DollarSign, TrendingUp, Activity } from "lucide-react";

export function FinancialView({ data }) {
    if (!data?.agent_results?.financial_analyst) return <div className="p-4 text-gray-400">Financial data not available</div>;

    const financial = data.agent_results.financial_analyst;
    // Fallback if data structure varies
    const metrics = financial.metrics || {};
    const analysis = financial.reasoning || "No analysis provided.";

    const healthScore = financial.score || 0;

    const kpis = [
        { label: "Burn Rate", value: metrics.burn_rate ? `$${metrics.burn_rate}/mo` : "N/A", icon: Activity },
        { label: "Runway", value: metrics.runway_months ? `${metrics.runway_months} Months` : "N/A", icon: TrendingUp },
        { label: "EBITDA", value: metrics.ebitda ? `$${metrics.ebitda}` : "N/A", icon: DollarSign },
        { label: "Gross Margin", value: metrics.gross_margin ? `${metrics.gross_margin}%` : "N/A", icon: Activity },
    ];

    const chartData = [
        { name: "Revenue", value: metrics.revenue || 0 },
        { name: "Expenses", value: metrics.expenses || 0 },
        { name: "Burn", value: metrics.burn_rate || 0 },
    ];

    return (
        <div className="space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <Card key={i} className="bg-[#202020] border-gray-800">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <kpi.icon className="h-6 w-6 text-blue-500 mb-2" />
                            <div className="text-sm text-gray-400">{kpi.label}</div>
                            <div className="text-xl font-bold text-white mt-1">{kpi.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Health Score */}
                <Card className="bg-[#202020] border-gray-800 md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-white">Financial Health</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <ScoreGauge score={healthScore} />
                    </CardContent>
                </Card>

                {/* Financial Mix */}
                <Card className="bg-[#202020] border-gray-800 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white">Revenue vs Burn</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart data={chartData} xKey="name" yKey="value" color="#3b82f6" />
                    </CardContent>
                </Card>
            </div>

            {/* Analysis Text */}
            <Card className="bg-[#202020] border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">CFO Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300 whitespace-pre-line">{analysis}</p>
                </CardContent>
            </Card>
        </div>
    );
}
