"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge } from "./charts";
const Alert = ({ children, className }) => <div className={`p-4 rounded-lg border ${className}`}>{children}</div>;
const AlertTitle = ({ children }) => <h5 className="font-bold mb-1">{children}</h5>;
const AlertDescription = ({ children }) => <div className="text-sm opacity-90">{children}</div>;
const ShieldAlert = (props) => <span {...props}>🛡️</span>;

export function RiskView({ data }) {
    const risk = data?.agent_results?.risk;

    if (!risk || risk.error) {
        return <div className="p-8 text-center text-gray-400 border border-dashed border-gray-800 rounded-xl">Risk analysis data not available for this report.</div>;
    }

    const risks = Array.isArray(risk.risks) ? risk.risks : [];
    const safetyScore = risk.score || 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-3 gap-6">
                {/* Risk Score */}
                <Card className="bg-transparent border-border md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-foreground">Safety Score</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                        <ScoreGauge score={safetyScore} />
                        <p className="text-xs text-gray-400 mt-2 text-center px-4">
                            Higher scores indicate lower perceived risk exposure.
                        </p>
                    </CardContent>
                </Card>

                {/* Risk List */}
                <Card className="bg-transparent border-border md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-foreground">Identified Vulnerabilities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {risks.map((r, i) => (
                            <Alert key={i} className="bg-red-950/10 border-red-900/20 hover:bg-red-950/20 transition-colors">
                                <div className="flex gap-3">
                                    <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-1" />
                                    <div>
                                        <AlertTitle className="text-red-400 text-sm">{r.category || r.label || "General Risk"}</AlertTitle>
                                        <AlertDescription className="text-muted-foreground leading-relaxed">
                                            {r.description || r.detail || r}
                                        </AlertDescription>
                                    </div>
                                </div>
                            </Alert>
                        ))}
                        {risks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-green-500 opacity-60">
                                <ShieldAlert className="h-8 w-8 mb-2" />
                                <p>No major risks identified by the AI agent.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-transparent border-border">
                <CardHeader>
                    <CardTitle className="text-foreground">Mitigation Strategy & Roadmap</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {risk.reasoning || risk.analysis || risk.mitigation || "No detailed mitigation strategy provided."}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
