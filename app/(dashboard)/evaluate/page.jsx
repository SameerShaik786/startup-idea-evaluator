"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvaluationForm } from "@/components/evaluate/evaluation-form";

export default function EvaluatePage() {
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
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Evaluation failed. Please try again.");
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

    if (result) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pt-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 border border-green-500/20 bg-green-500/5 rounded-xl text-center space-y-4"
                >
                    <div className="mx-auto h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <FileText className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-semibold text-green-500">Evaluation Complete</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Your startup <strong>{result.startup_id}</strong> has been analyzed by our multi-agent system.
                    </p>
                    <div className="pt-4 flex justify-center gap-4">
                        <Button asChild variant="outline">
                            <a href={`/reports/${result.startup_id}`}>View Full Report</a>
                        </Button>
                        <Button onClick={() => setResult(null)}>Submit Another</Button>
                    </div>
                </motion.div>

                {/* Debug Data */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border overflow-hidden">
                    <details>
                        <summary className="cursor-pointer text-xs font-mono text-muted-foreground mb-2">
                            View Raw Analysis JSON (Layers 1-8 Output)
                        </summary>
                        <pre className="text-xs font-mono text-muted-foreground overflow-auto max-h-[400px]">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </details>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto relative">
            {/* Loading Overlay */}
            {isSubmitting && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium animate-pulse">
                            Orchestrating AI Agents...
                        </p>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start justify-between"
            >
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <FileText className="h-4 w-4" />
                        Startup Application
                    </div>
                    <h1 className="text-2xl font-medium tracking-tight">
                        Submit for Evaluation
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Complete all sections to receive a comprehensive AI-powered analysis of your startup.
                    </p>
                </div>
            </motion.div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Evaluation Form */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className={isSubmitting ? "opacity-50 pointer-events-none" : ""}
            >
                <EvaluationForm onSubmit={handleSubmit} />
            </motion.div>
        </div>
    );
}
