"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge } from "./charts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export function RiskView({ data }) {
    if (!data?.agent_results?.risk_analyst) return <div className="p-4 text-gray-400">Risk data not available</div>;

    const risk = data.agent_results.risk_analyst;
    const risks = risk.risks || [];

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
                {/* Risk Score */}
                <Card className="bg-[#202020] border-gray-800 md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-white">Risk Exposure</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        {/* Low score here means HIGH risk, so we might need to invert visual logic if 100=Safe */}
                        {/* For now assuming the score is "Safety Score" where 100 is best. */}
                        <ScoreGauge score={risk.score || 0} />
                    </CardContent>
                </Card>

                {/* Risk List */}
                <Card className="bg-[#202020] border-gray-800 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white">Identified Risks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {risks.map((r, i) => (
                            <Alert key={i} className="bg-red-900/10 border-red-900/30">
                                <ShieldAlert className="h-4 w-4 text-red-500" />
                                <AlertTitle className="text-red-400">{r.category || "General Risk"}</AlertTitle>
                                <AlertDescription className="text-gray-300">
                                    {r.description}
                                </AlertDescription>
                            </Alert>
                        ))}
                        {risks.length === 0 && <p className="text-green-500">No major risks identified.</p>}
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-[#202020] border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">Mitigation Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300">{risk.reasoning || "No mitigation strategy provided."}</p>
                </CardContent>
            </Card>
        </div>
    );
}
