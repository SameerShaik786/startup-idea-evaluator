"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvaluationForm } from "@/components/evaluate/evaluation-form";
import { AgentProgressPanel } from "@/components/evaluate/AgentProgressPanel";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

// Simulated agent pipeline timing (ms delays from start)
const AGENT_TIMELINE = [
    { agent: "validator", runAt: 0, completeAt: 3000 },
    { agent: "financial", runAt: 3200, completeAt: null },
    { agent: "market", runAt: 3200, completeAt: null },
    { agent: "competition", runAt: 3200, completeAt: null },
    { agent: "financial", runAt: null, completeAt: 12000 },
    { agent: "market", runAt: null, completeAt: 13000 },
    { agent: "competition", runAt: null, completeAt: 14000 },
    { agent: "risk", runAt: 14500, completeAt: null },
    { agent: "longevity", runAt: 14500, completeAt: null },
    { agent: "investor_fit", runAt: 14500, completeAt: null },
    { agent: "risk", runAt: null, completeAt: 24000 },
    { agent: "longevity", runAt: null, completeAt: 25000 },
    { agent: "investor_fit", runAt: null, completeAt: 26000 },
    { agent: "scoring", runAt: 26500, completeAt: null },
];

export default function EvaluatePage() {
    const { user, session } = useAuth();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [result, setResult] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [agentStatuses, setAgentStatuses] = React.useState({});
    const timersRef = React.useRef([]);

    // Start simulated progress animation
    const startSimulatedProgress = React.useCallback(() => {
        // Clear any previous timers
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        AGENT_TIMELINE.forEach((event) => {
            if (event.runAt !== null) {
                const t = setTimeout(() => {
                    setAgentStatuses((prev) => ({ ...prev, [event.agent]: "running" }));
                }, event.runAt);
                timersRef.current.push(t);
            }
            if (event.completeAt !== null) {
                const t = setTimeout(() => {
                    setAgentStatuses((prev) => ({ ...prev, [event.agent]: "completed" }));
                }, event.completeAt);
                timersRef.current.push(t);
            }
        });
    }, []);

    // Cleanup timers on unmount
    React.useEffect(() => {
        return () => timersRef.current.forEach(clearTimeout);
    }, []);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        setError(null);
        setAgentStatuses({});

        // Start simulated progress immediately
        startSimulatedProgress();

        try {
            const response = await fetch("/api/py/evaluate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token || ""}`,
                },
                body: JSON.stringify({
                    ...data,
                    user_id: user?.id || null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.detail || "Evaluation failed. Please try again."
                );
            }

            const resultData = await response.json();

            // Mark all agents as completed and scoring done
            setAgentStatuses({
                validator: "completed",
                financial: "completed",
                market: "completed",
                competition: "completed",
                risk: "completed",
                longevity: "completed",
                investor_fit: "completed",
                scoring: "completed",
            });

            // Brief pause to show all-complete state
            await new Promise((r) => setTimeout(r, 800));
            setResult(resultData);
        } catch (err) {
            console.error(err);
            setError(err.message);
            // Clear timers on error
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── success state ────────────────────────────────── */
    if (result) {
        return (
            <div className="max-w-xl mx-auto pt-20 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    </div>

                    <h2 className="text-xl font-bold tracking-tight mb-2">
                        Evaluation Complete
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Your startup has been analyzed by our multi-agent
                        system. View the full report or submit another idea.
                    </p>

                    <div className="flex justify-center gap-3 mt-8">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/reports/${result.startup_id}`}>
                                View Full Report
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setResult(null)}
                        >
                            Submit Another
                        </Button>
                    </div>

                    {/* Persistence Warning */}
                    {
                        result._persistence && !result._persistence.saved && (
                            <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm text-left">
                                <strong className="flex items-center gap-2">
                                    <span className="text-lg">Warning:</span> Report Not Saved
                                </strong>
                                <p className="mt-1 opacity-90">
                                    This evaluation was generated successfully but could not be saved to the database.
                                    You won&#39;t be able to access this report later.
                                </p>
                                {result._persistence.dry_run && (
                                    <p className="mt-1 text-xs opacity-70">
                                        (Reason: Backend running in dry-run mode / missing Supabase credentials)
                                    </p>
                                )}
                            </div>
                        )
                    }

                    {/* collapsible raw JSON */}
                    <details className="mt-10 text-left">
                        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                            View raw analysis JSON
                        </summary>
                        <pre className="mt-3 text-xs font-mono text-muted-foreground overflow-auto max-h-[300px] p-4 rounded-lg border border-border bg-card/50">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </details>
                </motion.div>
            </div>
        );
    }

    /* ── submitting state — show agent progress panel ── */
    if (isSubmitting) {
        return (
            <div className="max-w-6xl mx-auto pt-10">
                <AgentProgressPanel
                    agentStatuses={agentStatuses}
                    error={error}
                />
            </div>
        );
    }

    /* ── form state ───────────────────────────────────── */
    return (
        <div className="max-w-6xl mx-auto relative">
            {/* header */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
            >
                <h1 className="text-2xl font-bold tracking-tight">
                    Submit for Evaluation
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Complete all sections to receive a comprehensive AI-powered
                    analysis.
                </p>
            </motion.div>

            {/* error */}
            {error && (
                <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-sm text-red-400">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* form */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <EvaluationForm onSubmit={handleSubmit} />
            </motion.div>
        </div>
    );
}
