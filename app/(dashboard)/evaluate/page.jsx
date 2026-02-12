"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvaluationForm } from "@/components/evaluate/evaluation-form";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function EvaluatePage() {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [result, setResult] = React.useState(null);
    const [error, setError] = React.useState(null);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch("/api/py/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
            setResult(resultData);
        } catch (err) {
            console.error(err);
            setError(err.message);
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

    /* ── form state ───────────────────────────────────── */
    return (
        <div className="max-w-6xl mx-auto relative">
            {/* loading overlay */}
            {isSubmitting && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-7 w-7 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground animate-pulse">
                            Orchestrating AI Agents…
                        </p>
                    </div>
                </div>
            )}

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
                className={isSubmitting ? "opacity-50 pointer-events-none" : ""}
            >
                <EvaluationForm onSubmit={handleSubmit} />
            </motion.div>
        </div>
    );
}
