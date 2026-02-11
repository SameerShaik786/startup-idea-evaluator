"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
    { id: 1, name: "Identity", shortName: "Identity" },
    { id: 2, name: "Problem & Customer", shortName: "Problem" },
    { id: 3, name: "Financials", shortName: "Financials" },
    { id: 4, name: "Product & Traction", shortName: "Product" },
    { id: 5, name: "Market & Competition", shortName: "Market" },
    { id: 6, name: "Team", shortName: "Team" },
];

export function StepProgress({ currentStep, completedSteps = [], onStepClick }) {
    return (
        <div className="w-full">
            {/* Desktop View */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = completedSteps.includes(step.id);
                    const isClickable = isCompleted || step.id <= currentStep;

                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            <button
                                onClick={() => isClickable && onStepClick?.(step.id)}
                                disabled={!isClickable}
                                className={cn(
                                    "flex items-center gap-3 transition-all",
                                    isClickable && "cursor-pointer",
                                    !isClickable && "cursor-not-allowed opacity-50"
                                )}
                            >
                                {/* Step Circle */}
                                <div
                                    className={cn(
                                        "flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all text-sm font-medium",
                                        isCompleted && "bg-[var(--success)] text-white",
                                        isActive && !isCompleted && "border-primary bg-primary text-primary-foreground",
                                        !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        step.id
                                    )}
                                </div>

                                {/* Step Label */}
                                <div className="text-left">
                                    <p
                                        className={cn(
                                            "text-sm font-medium",
                                            isActive && "text-foreground",
                                            isCompleted && "text-[var(--success)]",
                                            !isActive && !isCompleted && "text-muted-foreground"
                                        )}
                                    >
                                        {step.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Step {step.id} of {steps.length}
                                    </p>
                                </div>
                            </button>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 mx-4">
                                    <div
                                        className={cn(
                                            "h-0.5 w-full transition-all",
                                            completedSteps.includes(step.id)
                                                ? "bg-[var(--success)]"
                                                : "bg-muted-foreground/20"
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                        Step {currentStep}: {steps[currentStep - 1]?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {currentStep} of {steps.length}
                    </span>
                </div>
                <div className="flex gap-1">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={cn(
                                "flex-1 h-1.5 rounded-full transition-all",
                                completedSteps.includes(step.id) && "bg-green-500",
                                step.id === currentStep && !completedSteps.includes(step.id) && "bg-primary",
                                step.id > currentStep && "bg-muted-foreground/20"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
