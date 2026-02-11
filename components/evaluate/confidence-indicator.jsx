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
        if (percentage >= 90) return { label: "Excellent", color: "text-[var(--success)]", bg: "bg-[var(--success)]" };
        if (percentage >= 70) return { label: "Good", color: "text-blue-500", bg: "bg-blue-500" };
        if (percentage >= 50) return { label: "Fair", color: "text-amber-500", bg: "bg-amber-500" };
        return { label: "Incomplete", color: "text-muted-foreground", bg: "bg-muted-foreground" };
    };

    const confidence = getConfidenceLevel(overallPercentage);

    return (
        <div className={cn("space-y-4", className)}>
            {/* Overall Score */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Application Completeness
                    </p>
                    <p className={cn("text-lg font-semibold", confidence.color)}>
                        {overallPercentage}% — {confidence.label}
                    </p>
                </div>
                <div className="relative h-12 w-12">
                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-muted/30"
                        />
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${overallPercentage}, 100`}
                            className={confidence.color}
                        />
                    </svg>
                </div>
            </div>

            {/* Section Breakdown */}
            <div className="space-y-2">
                {sections.map((section) => {
                    const sectionPercentage = section.totalFields > 0
                        ? Math.round((section.completedFields / section.totalFields) * 100)
                        : 0;
                    const isComplete = sectionPercentage === 100;

                    return (
                        <div key={section.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                {isComplete ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground/50" />
                                )}
                                <span className={isComplete ? "text-foreground" : "text-muted-foreground"}>
                                    {section.name}
                                </span>
                            </div>
                            <span className={cn(
                                "text-xs",
                                isComplete ? "text-green-500" : "text-muted-foreground"
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
