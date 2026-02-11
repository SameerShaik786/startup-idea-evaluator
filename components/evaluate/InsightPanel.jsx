"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, Check, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function InsightPanel({
    title = "AI Analysis",
    insight = "The market size appears underestimated based on recent CAGR reports for this sector.",
    confidence = 85,
    type = "neutral", // neutral, positive, negative, warning
    expandedContent = "Detailed reasoning: Our agents analyzed 50+ competitor reports and found that the TAM is likely 3x larger than projected in the deck. However, the SAM is constrained by regulatory hurdles in the EU market which were not addressed."
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getTypeStyles = () => {
        switch (type) {
            case "positive": return "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400";
            case "negative": return "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400";
            case "warning": return "bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400";
            default: return "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400";
        }
    };

    const getIcon = () => {
        switch (type) {
            case "positive": return Check;
            case "negative": return AlertTriangle;
            case "warning": return AlertTriangle;
            default: return Sparkles;
        }
    };

    const Icon = getIcon();

    return (
        <Card className={cn("glass-card overflow-hidden transition-all duration-300", isExpanded ? "ring-2 ring-primary/20" : "")}>
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-lg shrink-0", getTypeStyles())}>
                        <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                {title}
                                <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                                    {confidence}% Conf.
                                </span>
                            </h4>
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </motion.div>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            {insight}
                        </p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pl-[4.5rem]">
                            <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground leading-relaxed border border-border">
                                <div className="flex items-center gap-2 mb-2 text-foreground font-medium text-xs uppercase tracking-wide">
                                    <Info className="h-3 w-3" />
                                    Agent Reasoning
                                </div>
                                {expandedContent}
                            </div>
                            {/* Feedback Actions */}
                            <div className="flex gap-2 mt-3">
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                                    Helpful
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                                    Request Clarification
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
