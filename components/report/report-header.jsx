"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShieldAlert, TrendingUp, DollarSign, Target } from "lucide-react";

export function ReportHeader({ data, onComponentClick, activeSegment }) {
    if (!data) return null;

    const {
        startup_name,
        final_score,
        risk_label,
        component_scores,
        metadata
    } = data;

    const scoreColor =
        final_score >= 80 ? "text-green-500" :
            final_score >= 60 ? "text-yellow-500" : "text-red-500";

    const riskColor =
        risk_label === "Low" ? "bg-green-500/20 text-green-500 border-green-500/50" :
            risk_label === "Medium" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" :
                "bg-red-500/20 text-red-500 border-red-500/50";

    const components = [
        { id: "financial", label: "Financial", icon: DollarSign, score: component_scores?.financial || 0 },
        { id: "market", label: "Market", icon: TrendingUp, score: component_scores?.market || 0 },
        { id: "risk", label: "Risk", icon: ShieldAlert, score: component_scores?.risk || 0 },
        { id: "validation", label: "Validator", icon: Target, score: component_scores?.validation || 0 },
    ];

    return (
        <div className="bg-[#202020] border-b border-gray-800 p-6 shadow-md">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                    {/* Title Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                {startup_name || "Startup Analysis"}
                            </h1>
                            <Badge variant="outline" className={cn("border", riskColor)}>
                                {risk_label || "Unknown"} Risk
                            </Badge>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Generated on {metadata?.created_at ? format(new Date(metadata.created_at), "PPP p") : "Just now"}
                        </p>
                    </div>

                    {/* Score Display */}
                    <div className="flex items-center gap-4 bg-black/20 p-3 rounded-lg border border-white/5">
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">AI Score</p>
                            <div className={cn("text-4xl font-black", scoreColor)}>
                                {Math.round(final_score)}
                            </div>
                        </div>
                        {/* Component Badges */}
                        <div className="flex gap-2">
                            {components.map((comp) => (
                                <button
                                    key={comp.id}
                                    onClick={() => onComponentClick(comp.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-2 rounded w-16 transition-all",
                                        "hover:bg-white/5 active:scale-95",
                                        activeSegment === comp.id ? "bg-white/10 ring-1 ring-white/20" : "bg-transparent"
                                    )}
                                >
                                    <comp.icon className="w-4 h-4 text-gray-400 mb-1" />
                                    <span className={cn("text-xs font-bold",
                                        comp.score >= 70 ? "text-green-400" :
                                            comp.score >= 50 ? "text-yellow-400" : "text-red-400"
                                    )}>
                                        {Math.round(comp.score)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
