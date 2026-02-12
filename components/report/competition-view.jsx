"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomRadarChart } from "./charts";
import { cn } from "@/lib/utils";

/* ── threat level styling ──────────────────────────────── */
function getThreatStyle(level) {
    const l = (level || "medium").toLowerCase();
    if (l === "high") return "text-red-400 bg-red-500/10 border-red-500/20";
    if (l === "low") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
}

export function CompetitionView({ data }) {
    const comp = data?.agent_results?.competition;

    if (!comp || comp.error) {
        return (
            <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                Competitor analysis data not available for this report.
            </div>
        );
    }

    const competitors = Array.isArray(comp.competitors) ? comp.competitors : [];

    // Radar Data
    const radarData = [
        { subject: "Innovation", A: comp.innovation_score || comp.innovation || 0, fullMark: 100 },
        { subject: "Market Share", A: comp.market_share_score || comp.market_share || 0, fullMark: 100 },
        { subject: "Brand", A: comp.brand_score || comp.brand || 0, fullMark: 100 },
        { subject: "Pricing", A: comp.pricing_score || comp.pricing || 0, fullMark: 100 },
        { subject: "Product", A: comp.product_score || comp.product || 0, fullMark: 100 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Competitive Landscape Radar */}
                <Card className="border-border" style={{ backgroundColor: "transparent" }}>
                    <CardHeader>
                        <CardTitle className="text-foreground">Competitive Intelligence Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomRadarChart data={radarData} />
                    </CardContent>
                </Card>

                {/* Competitor List */}
                <Card className="border-border" style={{ backgroundColor: "transparent" }}>
                    <CardHeader>
                        <CardTitle className="text-foreground">Direct &amp; Indirect Competitors</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-3">
                            {competitors.length > 0 ? (
                                competitors.map((c, i) => {
                                    const name = c.name || c;
                                    const initials = (typeof name === "string" ? name : "?")
                                        .split(" ")
                                        .map((w) => w[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase();

                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/20 transition-colors"
                                            style={{ backgroundColor: "var(--background)" }}
                                        >
                                            {/* initials circle */}
                                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 border border-border flex items-center justify-center select-none shrink-0">
                                                <span className="text-xs font-semibold text-primary">
                                                    {initials}
                                                </span>
                                            </div>

                                            {/* info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-medium text-foreground truncate">
                                                    {typeof name === "string" ? name : "Competitor"}
                                                </p>
                                                {c.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                                        {c.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* threat badge */}
                                            <span className={cn(
                                                "text-xs font-medium px-3 py-1.5 rounded-full border shrink-0",
                                                getThreatStyle(c.threat_level)
                                            )}>
                                                {c.threat_level || "Medium"}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <p className="italic">No specific competitors identified in the analysis.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border" style={{ backgroundColor: "transparent" }}>
                <CardHeader>
                    <CardTitle className="text-foreground">Moat &amp; Defense Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {comp.reasoning || comp.analysis || "No detailed competitive defense strategy provided."}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
