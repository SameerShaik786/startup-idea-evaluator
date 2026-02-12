"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomBarChart, ScoreGauge } from "./charts";
const DollarSign = (props) => <span {...props}>$</span>;
const TrendingUp = (props) => <span {...props}>📈</span>;
const Activity = (props) => <span {...props}>⚡</span>;

export function FinancialView({ data }) {
    const financial = data?.agent_results?.financial;

    if (!financial || financial.error) {
        return <div className="p-8 text-center text-gray-400 border border-dashed border-gray-800 rounded-xl">Financial analysis data not available for this report.</div>;
    }

    const metrics = financial.metrics || {};
    const analysis = financial.reasoning || financial.analysis || "No analysis provided.";
    const healthScore = financial.score || 0;

    // Helper to format values
    const formatValue = (val, type) => {
        if (val === undefined || val === null) return "N/A";
        if (type === 'currency') return `$${val}`;
        if (type === 'percent') return `${val}%`;
        if (type === 'months') return `${val} Mo`;
        return val;
    };

    const kpis = [
        { label: "Burn Rate", value: formatValue(metrics.burn_rate, 'currency'), icon: Activity },
        { label: "Runway", value: formatValue(metrics.runway_months, 'months'), icon: TrendingUp },
        { label: "EBITDA", value: formatValue(metrics.ebitda, 'currency'), icon: DollarSign },
        { label: "Gross Margin", value: formatValue(metrics.gross_margin, 'percent'), icon: Activity },
    ];

    const chartData = [
        { name: "Revenue", value: parseFloat(metrics.revenue) || 0 },
        { name: "Expenses", value: parseFloat(metrics.expenses) || 0 },
        { name: "Burn", value: parseFloat(metrics.burn_rate) || 0 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <Card key={i} className="bg-transparent border-border">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <kpi.icon className="h-6 w-6 text-blue-500 mb-2" />
                            <div className="text-sm text-gray-400 font-medium">{kpi.label}</div>
                            <div className="text-xl font-bold text-foreground mt-1 uppercase tracking-tight">{kpi.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Health Score */}
                <Card className="bg-transparent border-border md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-foreground">Financial Health</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <ScoreGauge score={healthScore} />
                    </CardContent>
                </Card>

                {/* Financial Mix */}
                <Card className="bg-transparent border-border md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-foreground">Revenue vs Burn Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart data={chartData} xKey="name" yKey="value" color="#3b82f6" />
                    </CardContent>
                </Card>
            </div>

            {/* Analysis Text */}
            <Card className="bg-transparent border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">CFO Analysis & Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{analysis}</p>
                </CardContent>
            </Card>
        </div>
    );
}
