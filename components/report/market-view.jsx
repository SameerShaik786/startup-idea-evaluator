"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomBarChart } from "./charts";

export function MarketView({ data }) {
    if (!data?.agent_results?.market_analyst) return <div className="p-4 text-gray-400">Market data not available</div>;

    const market = data.agent_results.market_analyst;

    // Market Sizing Data (Simulated Funnel)
    const tamSamSom = [
        { name: "TAM", value: market.tam || 100, fill: "#1e3a8a" }, // Dark Blue
        { name: "SAM", value: market.sam || 50, fill: "#2563eb" },  // Blue
        { name: "SOM", value: market.som || 10, fill: "#60a5fa" },  // Light Blue
    ];

    const marketTrends = market.trends || ["No specific trends identified."];

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Market Sizing */}
                <Card className="bg-[#202020] border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">Market Opportunity (TAM/SAM/SOM)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart data={tamSamSom} xKey="name" yKey="value" color="#3b82f6" />
                    </CardContent>
                </Card>

                {/* Growth Potential */}
                <Card className="bg-[#202020] border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">Market Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-400 uppercase">Growth Rate</h4>
                            <div className="text-3xl font-bold text-white">{market.growth_rate || "N/A"}%</div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 uppercase mb-2">Key Trends</h4>
                            <ul className="space-y-2">
                                {marketTrends.map((trend, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                                        <span className="text-blue-500">•</span>
                                        {trend}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-[#202020] border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">Market Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300 leading-relaxed">
                        {market.reasoning || "No detailed strategy provided."}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
