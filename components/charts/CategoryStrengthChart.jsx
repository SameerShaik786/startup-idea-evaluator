"use client";

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
    { name: "Market", score: 82 },
    { name: "Product", score: 85 },
    { name: "Traction", score: 88 },
    { name: "Team", score: 91 },
    { name: "Moat", score: 76 },
];

export function CategoryStrengthChart({ scores = data }) {
    // Institutional aesthetic: muted backgrounds, single accent color
    // Dark mode: bg-sidebar/60 (from globals) -> handled by parent card class
    // Bars: accent color (primary)

    return (
        <Card className="glass-card h-full">
            <CardHeader>
                <CardTitle className="text-lg font-medium">Category Strength</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={scores}
                            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                        >
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={80}
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--popover))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "8px",
                                    color: "hsl(var(--popover-foreground))",
                                }}
                            />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                                {scores.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.score >= 80 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} // institutional highlight for high scores only? Or consistent color?
                                        // Let's use primary for all for consistency, maybe vary opacity
                                        fillOpacity={0.9}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
