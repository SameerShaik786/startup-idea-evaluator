"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
    { name: "Market Risk", value: 30 },
    { name: "Execution Risk", value: 45 },
    { name: "Competition Risk", value: 15 },
    { name: "Data Confidence", value: 10 },
];

const COLORS = [
    "hsl(var(--destructive))", // High risk? Or just distinct
    "hsl(var(--warning))",
    "hsl(var(--primary))",
    "hsl(var(--muted-foreground))",
];

// Muted Institutional Palette
const MUTED_COLORS = [
    "#6B7C8F",
    "#3A4656",
    "#8AA2B3",
    "#B0C4D1"
];

export function RiskDistributionChart({ riskData = data }) {
    return (
        <Card className="glass-card h-full">
            <CardHeader>
                <CardTitle className="text-lg font-medium">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={riskData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={MUTED_COLORS[index % MUTED_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--popover))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "8px",
                                    color: "hsl(var(--popover-foreground))",
                                }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
