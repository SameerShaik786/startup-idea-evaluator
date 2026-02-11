"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomRadarChart } from "./charts";
import { Badge } from "@/components/ui/badge";

export function CompetitionView({ data }) {
    if (!data?.agent_results?.competitor_analyst) return <div className="p-4 text-gray-400">Competitor data not available</div>;

    const comp = data.agent_results.competitor_analyst;
    const competitors = comp.competitors || [];

    // Radar Data
    const radarData = [
        { subject: 'Innovation', A: comp.innovation_score || 0, fullMark: 100 },
        { subject: 'Market Share', A: comp.market_share_score || 0, fullMark: 100 },
        { subject: 'Brand', A: comp.brand_score || 0, fullMark: 100 },
        { subject: 'Pricing', A: comp.pricing_score || 0, fullMark: 100 },
        { subject: 'Product', A: comp.product_score || 0, fullMark: 100 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Competitive Landscape Radar */}
                <Card className="bg-[#202020] border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">Competitive Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomRadarChart data={radarData} />
                    </CardContent>
                </Card>

                {/* Competitor List */}
                <Card className="bg-[#202020] border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">Key Competitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {competitors.length > 0 ? (
                                competitors.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-white font-medium">{c.name}</span>
                                        <Badge variant="outline" className="border-gray-600 text-gray-400">
                                            {c.threat_level || "Unknown"} Threat
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 italic">No specific competitors listed.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-[#202020] border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">Defense Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300">{comp.reasoning || "No analysis provided."}</p>
                </CardContent>
            </Card>
        </div>
    );
}
