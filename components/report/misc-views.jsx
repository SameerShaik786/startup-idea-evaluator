"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomLineChart } from "./charts";

export function LongevityView({ data }) {
    const longevity = data?.agent_results?.longevity;

    if (!longevity || longevity.error) {
        return <div className="p-8 text-center text-gray-400 border border-dashed border-gray-800 rounded-xl">Longevity analysis data not available for this report.</div>;
    }

    const scale = (s) => (s <= 1 && s > 0) ? s * 100 : s;
    const prob3yr = scale(longevity.survival_probability_3yr || 0);
    const prob5yr = scale(longevity.survival_probability_5yr || 0);

    // Line Chart Data: Start (100%), 3-Year, 5-Year
    const survivalData = [
        { year: 'Launch', rate: 100 },
        { year: '3 Year', rate: prob3yr },
        { year: '5 Year', rate: prob5yr },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-transparent border-border md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-foreground">Survival Probability Forecast</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomLineChart data={survivalData} xKey="year" yKey="rate" color="#8b5cf6" />
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card className="bg-transparent border-border">
                        <CardContent className="pt-6">
                            <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">3-Year Survival</div>
                            <div className="text-4xl font-bold text-purple-500 mt-1">{prob3yr}%</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-transparent border-border">
                        <CardContent className="pt-6">
                            <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">5-Year Survival</div>
                            <div className="text-4xl font-bold text-purple-400 mt-1">{prob5yr}%</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card className="bg-transparent border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">Intelligence Reasoning & Roadmap</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {longevity.reasoning || longevity.analysis || "No detailed longevity strategy provided."}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export function InvestorFitView({ data }) {
    const fit = data?.agent_results?.investor_fit;

    if (!fit || fit.error) {
        return <div className="p-8 text-center text-gray-400 border border-dashed border-gray-800 rounded-xl">Investor fit analysis data not available for this report.</div>;
    }

    // Checking if the multi-domain breakdown exists (for the "7 domains" requirement)
    const domainBreakdown = fit.domain_analysis || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-transparent border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Recommended Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div>
                            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Recommended Investor Type</h4>
                            <p className="text-foreground text-xl font-bold mt-1">{fit.recommended_investor_type || "N/A"}</p>
                        </div>
                        <div>
                            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Target Funding Stage</h4>
                            <p className="text-foreground text-xl font-bold mt-1 text-primary">{fit.recommended_stage || "N/A"}</p>
                        </div>
                        <div>
                            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Optimal Ticket Size</h4>
                            <p className="text-foreground text-xl font-bold mt-1">{fit.ticket_size_range || "N/A"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-transparent border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Strategic Fit Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {fit.reasoning || "No detailed fit analysis provided."}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {domainBreakdown.length > 0 && (
                <Card className="bg-transparent border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Cross-Domain Investment Thesis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-4 gap-4">
                            {domainBreakdown.map((domain, i) => (
                                <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/5">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">{domain.name}</div>
                                    <div className="text-sm text-gray-200 mt-1 font-medium">{domain.insight}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
