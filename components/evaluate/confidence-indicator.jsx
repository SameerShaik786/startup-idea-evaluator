"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export function ConfidenceIndicator({ sections, className }) {
    // Calculate overall completion percentage
    const totalFields = sections.reduce((acc, s) => acc + s.totalFields, 0);
    const completedFields = sections.reduce((acc, s) => acc + s.completedFields, 0);
    const overallPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    // Determine confidence level
    const getConfidenceLevel = (percentage) => {
        if (percentage >= 90) return { label: "Excellent", color: "text-emerald-400", ring: "stroke-emerald-400" };
        if (percentage >= 70) return { label: "Good", color: "text-blue-400", ring: "stroke-blue-400" };
        if (percentage >= 50) return { label: "Fair", color: "text-amber-400", ring: "stroke-amber-400" };
        return { label: "Incomplete", color: "text-muted-foreground", ring: "stroke-muted-foreground" };
    };

    const confidence = getConfidenceLevel(overallPercentage);

    return (
        <div className={cn("space-y-5", className)}>
            {/* Overall Score — centered ring */}
            <div className="flex flex-col items-center text-center py-2">
                <div className="relative h-20 w-20 mb-3">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                        <circle
                            cx="18" cy="18" r="15.5"
                            fill="none"
                            strokeWidth="2.5"
                            className="stroke-border"
                        />
                        <circle
                            cx="18" cy="18" r="15.5"
                            fill="none"
                            strokeWidth="2.5"
                            strokeDasharray={`${overallPercentage}, 100`}
                            strokeLinecap="round"
                            className={cn("transition-all duration-700 ease-out", confidence.ring)}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={cn("text-lg font-bold tabular-nums", confidence.color)}>
                            {overallPercentage}%
                        </span>
                    </div>
                </div>
                <p className={cn("text-sm font-semibold", confidence.color)}>
                    {confidence.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Application Completeness
                </p>
            </div>

            {/* Section Breakdown */}
            <div className="space-y-2.5">
                {sections.map((section) => {
                    const sectionPercentage = section.totalFields > 0
                        ? Math.round((section.completedFields / section.totalFields) * 100)
                        : 0;
                    const isComplete = sectionPercentage === 100;

                    return (
                        <div key={section.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2.5">
                                {isComplete ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground/40" />
                                )}
                                <span className={isComplete ? "text-foreground font-medium" : "text-muted-foreground"}>
                                    {section.name}
                                </span>
                            </div>
                            <span className={cn(
                                "text-xs tabular-nums",
                                isComplete ? "text-emerald-400 font-medium" : "text-muted-foreground"
                            )}>
                                {section.completedFields}/{section.totalFields}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
