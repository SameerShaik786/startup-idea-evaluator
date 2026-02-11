"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const steps = [
    { id: "draft", label: "Draft", description: "Profile setup" },
    { id: "submitted", label: "Submitted", description: "Sent for analysis" },
    { id: "processing", label: "AI Analysis", description: "Agents working" },
    { id: "consensus", label: "Consensus", description: "Agents debating" },
    { id: "completed", label: "Completed", description: "Report ready" },
];

export function EvaluationTimeline({ currentStatus = "draft", events = [] }) {
    // Determine current step index
    const currentIndex = steps.findIndex((step) => step.id === currentStatus);
    // Default to -1 if status not found (e.g. "error")
    const activeStepIndex = currentIndex === -1 ? 0 : currentIndex;

    const getStepStatus = (index) => {
        if (index < activeStepIndex) return "completed";
        if (index === activeStepIndex) return "current";
        return "upcoming";
    };

    return (
        <div className="w-full py-4">
            <div className="relative flex flex-col md:flex-row justify-between w-full">
                {/* Progress Line Background */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted md:left-0 md:right-0 md:top-5 md:h-0.5 md:w-full -z-10" />

                {/* Active Progress Line */}
                <motion.div
                    className="absolute left-4 top-0 w-0.5 bg-primary md:left-0 md:top-5 md:h-0.5 -z-10 origin-top md:origin-left"
                    initial={{ height: 0, width: 0 }}
                    animate={{
                        height: "100%", // For mobile vertical
                        width: `${(activeStepIndex / (steps.length - 1)) * 100}%` // For desktop horizontal
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                />

                {steps.map((step, index) => {
                    const status = getStepStatus(index);
                    const isCompleted = status === "completed";
                    const isCurrent = status === "current";

                    return (
                        <div key={step.id} className="relative flex md:flex-col items-center gap-4 md:gap-2 mb-8 md:mb-0 last:mb-0">
                            {/* Step Indicator */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 bg-background",
                                    isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                        isCurrent ? "border-primary text-primary ring-4 ring-primary/20" :
                                            "border-muted text-muted-foreground"
                                )}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="h-6 w-6" />
                                ) : isCurrent ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Circle className="h-5 w-5" />
                                )}
                            </motion.div>

                            {/* Step Details */}
                            <div className="flex flex-col md:items-center md:text-center">
                                <span
                                    className={cn(
                                        "text-sm font-medium transition-colors duration-300",
                                        isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    {step.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {step.description}
                                </span>
                                {/* Optional Timestamp if available in events */}
                                {/* 
                {events.find(e => e.step === step.id) && (
                    <span className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(), 'MMM d, h:mm a')}
                    </span>
                )} 
                */}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
