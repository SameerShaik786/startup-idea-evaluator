"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomBarChart } from "./charts";

export function MarketView({ data }) {
    // The backend uses 'market' as the key
    const market = data?.agent_results?.market;

    if (!market || market.error) {
        return <div className="p-8 text-center text-gray-400 border border-dashed border-gray-800 rounded-xl">Market analysis data not available for this report.</div>;
    }

    // Market Sizing Data - handle potential string values from LLM
    const parseMarketValue = (val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            // Remove symbols like $, M, B, etc.
            const numeric = val.replace(/[^0-9.]/g, '');
            return parseFloat(numeric) || 0;
        }
        return 0;
    };

    const tamSamSom = [
        { name: "TAM", value: parseMarketValue(market.tam), fill: "#1e3a8a" },
        { name: "SAM", value: parseMarketValue(market.sam), fill: "#2563eb" },
        { name: "SOM", value: parseMarketValue(market.som), fill: "#60a5fa" },
    ];

    const marketTrends = Array.isArray(market.trends)
        ? market.trends
        : typeof market.trends === 'string'
            ? [market.trends]
            : ["No specific trends identified."];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Market Sizing */}
                <Card className="bg-transparent border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Market Opportunity (TAM/SAM/SOM)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-w-sm mx-auto">
                            <CustomBarChart data={tamSamSom} xKey="name" yKey="value" color="#3b82f6" height={220} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {tamSamSom.map(item => (
                                <div key={item.name} className="text-center p-2 rounded bg-muted/20">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">{item.name}</div>
                                    <div className="text-sm font-semibold text-foreground">{typeof market[item.name.toLowerCase()] === 'string' ? market[item.name.toLowerCase()] : `$${item.value}M`}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Growth Potential */}
                <Card className="bg-transparent border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Market Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-400 uppercase">Growth Rate</h4>
                            <div className="text-3xl font-bold text-blue-500">
                                {market.growth_rate || market.market_growth || "N/A"}{market.growth_rate && !String(market.growth_rate).includes('%') ? '%' : ''}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 uppercase mb-2">Key Trends</h4>
                            <ul className="space-y-2">
                                {marketTrends.map((trend, i) => (
                                    <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        {trend}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-transparent border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">Strategic Reasoning</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {market.reasoning || market.analysis || "No detailed strategy provided."}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
