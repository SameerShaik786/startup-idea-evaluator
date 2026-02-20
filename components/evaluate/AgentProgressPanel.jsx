"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    Circle,
    Loader2,
    Shield,
    DollarSign,
    BarChart3,
    Swords,
    AlertTriangle,
    Timer,
    UserCheck,
    Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PIPELINE_STEPS = [
    {
        group: "Step 1 - Validation",
        agents: [
            { id: "validator", label: "Validator Agent", icon: Shield, description: "Data consistency & completeness" },
        ],
    },
    {
        group: "Step 2 - Core Analysis",
        parallel: true,
        agents: [
            { id: "financial", label: "Financial Agent", icon: DollarSign, description: "Financial health analysis" },
            { id: "market", label: "Market Agent", icon: BarChart3, description: "TAM/SAM/SOM estimation" },
            { id: "competition", label: "Competition Agent", icon: Swords, description: "Competitive landscape" },
        ],
    },
    {
        group: "Step 3 - Advanced Analysis",
        parallel: true,
        agents: [
            { id: "risk", label: "Risk Agent", icon: AlertTriangle, description: "Risk identification & severity" },
            { id: "longevity", label: "Longevity Agent", icon: Timer, description: "Survival assessment" },
            { id: "investor_fit", label: "Investor Fit Agent", icon: UserCheck, description: "Investor matching" },
        ],
    },
    {
        group: "Post-Processing",
        agents: [
            { id: "scoring", label: "Scoring & Report", icon: Calculator, description: "Deterministic scoring & persistence" },
        ],
    },
];

function AgentStatusIcon({ status }) {
    if (status === "completed") {
        return (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </motion.div>
        );
    }
    if (status === "running") {
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
    }
    return <Circle className="h-4 w-4 text-muted-foreground/40" />;
}

export function AgentProgressPanel({ agentStatuses = {}, error = null }) {
    const getStatus = (agentId) => agentStatuses[agentId] || "pending";

    // Count completed agents
    const totalAgents = PIPELINE_STEPS.reduce((sum, step) => sum + step.agents.length, 0);
    const completedAgents = Object.values(agentStatuses).filter((s) => s === "completed").length;
    const progressPercent = Math.round((completedAgents / totalAgents) * 100);

    return (
        <div className="w-full max-w-lg mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-3"
                >
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Orchestrating Agents
                </motion.div>
                <h2 className="text-lg font-semibold tracking-tight">
                    Evaluation Pipeline
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                    {completedAgents}/{totalAgents} agents completed
                </p>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Pipeline Steps */}
            <div className="space-y-4">
                {PIPELINE_STEPS.map((step, stepIndex) => {
                    const allCompleted = step.agents.every((a) => getStatus(a.id) === "completed");
                    const anyRunning = step.agents.some((a) => getStatus(a.id) === "running");
                    const allPending = step.agents.every((a) => getStatus(a.id) === "pending");

                    return (
                        <motion.div
                            key={step.group}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: stepIndex * 0.08 }}
                            className={cn(
                                "rounded-xl border p-3 transition-all duration-300",
                                anyRunning
                                    ? "border-blue-500/30 bg-blue-500/5 shadow-sm shadow-blue-500/5"
                                    : allCompleted
                                        ? "border-emerald-500/20 bg-emerald-500/5"
                                        : "border-border/50 bg-card/30"
                            )}
                        >
                            {/* Group Header */}
                            <div className="flex items-center justify-between mb-2">
                                <span
                                    className={cn(
                                        "text-[11px] font-medium uppercase tracking-wider",
                                        anyRunning
                                            ? "text-blue-400"
                                            : allCompleted
                                                ? "text-emerald-400"
                                                : "text-muted-foreground/60"
                                    )}
                                >
                                    {step.group}
                                </span>
                                {step.parallel && (
                                    <span className="text-[10px] text-muted-foreground/40 font-mono">
                                        PARALLEL
                                    </span>
                                )}
                            </div>

                            {/* Agents */}
                            <div className="space-y-1.5">
                                {step.agents.map((agent) => {
                                    const status = getStatus(agent.id);
                                    const Icon = agent.icon;

                                    return (
                                        <div
                                            key={agent.id}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-2.5 py-2 transition-all duration-200",
                                                status === "running"
                                                    ? "bg-blue-500/10"
                                                    : status === "completed"
                                                        ? "bg-emerald-500/5"
                                                        : "bg-transparent"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors shrink-0",
                                                    status === "running"
                                                        ? "bg-blue-500/15 text-blue-400"
                                                        : status === "completed"
                                                            ? "bg-emerald-500/15 text-emerald-400"
                                                            : "bg-muted/50 text-muted-foreground/40"
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={cn(
                                                        "text-sm font-medium leading-none transition-colors",
                                                        status === "pending"
                                                            ? "text-muted-foreground/50"
                                                            : "text-foreground"
                                                    )}
                                                >
                                                    {agent.label}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                                                    {agent.description}
                                                </p>
                                            </div>

                                            <div className="shrink-0">
                                                <AgentStatusIcon status={status} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-sm text-red-400"
                    >
                        <strong>Error:</strong> {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
