"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomLineChart } from "./charts";

export function LongevityView({ data }) {
    // Mock data as backend might not provide timeseries yet
    const survivalData = [
        { year: 'Year 1', rate: 95 },
        { year: 'Year 2', rate: 80 },
        { year: 'Year 3', rate: 65 },
        { year: 'Year 4', rate: 50 },
        { year: 'Year 5', rate: 35 },
    ];

    return (
        <div className="space-y-6">
            <Card className="bg-[#202020] border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">Survival Probability Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomLineChart data={survivalData} xKey="year" yKey="rate" color="#8b5cf6" />
                </CardContent>
            </Card>
            <Card className="bg-[#202020] border-gray-800">
                <CardContent className="pt-6">
                    <p className="text-gray-300">
                        Based on current burn rate and market conditions, the startup shows a typical decay curve for seed-stage companies.
                        Key milestones in Year 2 will be critical for Series A viability.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export function InvestorFitView({ data }) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-[#202020] border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">Recommended Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="text-gray-400 text-sm">Investor Type</h4>
                        <p className="text-white text-lg font-medium">Early-Stage / Angel / Pre-Seed VC</p>
                    </div>
                    <div>
                        <h4 className="text-gray-400 text-sm">Typical Ticket Size</h4>
                        <p className="text-white text-lg font-medium">$25k - $100k</p>
                    </div>
                    <div>
                        <h4 className="text-gray-400 text-sm">Investment Horizon</h4>
                        <p className="text-white text-lg font-medium">5-7 Years</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-[#202020] border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">Fit Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300">
                        This startup matches the profile of high-risk, high-reward deep tech portfolios.
                        Founders should target investors with domain expertise in AI infrastructure.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
