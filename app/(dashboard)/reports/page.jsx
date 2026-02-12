"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, ArrowUpRight, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/* ── helpers ──────────────────────────────────────────── */
function getScoreColor(score) {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
}

function getScoreBg(score) {
    if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "bg-amber-500/10 border-amber-500/20";
    return "bg-red-500/10 border-red-500/20";
}

function Initials({ name }) {
    const letters = (name || "S")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-border flex items-center justify-center select-none shrink-0">
            <span className="text-sm font-semibold text-primary">{letters}</span>
        </div>
    );
}

/* ── report card ─────────────────────────────────────── */
function ReportCard({ report, index }) {
    const score = Math.round(report.score || 0);
    const components = Object.entries(report.component_scores || {}).slice(0, 4);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full"
        >
            <Link
                href={`/reports/${report.id}`}
                className="group block h-full"
            >
                <div className="flex flex-col h-full p-6 rounded-2xl border border-border hover:border-primary/30 bg-transparent transition-all duration-200">
                    {/* top — logo + name + score */}
                    <div className="flex items-start gap-4 mb-3">
                        <Initials name={report.title} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                                        {report.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                        {report.risk_label && (
                                            <>
                                                <span className="text-border">·</span>
                                                <span className="capitalize">{report.risk_label.replace("_", " ")}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className={cn(
                                    "flex items-center justify-center h-12 w-12 rounded-xl border shrink-0",
                                    getScoreBg(score)
                                )}>
                                    <span className={cn("text-lg font-bold tabular-nums", getScoreColor(score))}>
                                        {score}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* description */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                        {report.description}
                    </p>

                    {/* component scores bar */}
                    {components.length > 0 && (
                        <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                            {components.map(([key, value]) => (
                                <div key={key} className="flex items-center gap-1.5 text-sm">
                                    <span className="text-muted-foreground capitalize">{key}</span>
                                    <span className={cn("font-semibold tabular-nums", getScoreColor(Math.round(value)))}>
                                        {Math.round(value)}
                                    </span>
                                </div>
                            ))}
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}

/* ── page ─────────────────────────────────────────────── */
export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchReports() {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("startup_evaluations")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;

                const formattedReports = (data || []).map((item) => {
                    const reportJson = item.report_json || {};
                    let title =
                        reportJson.startup_name ||
                        item.startup_id ||
                        "Unknown Startup";
                    let description = "No summary available.";

                    const summary = reportJson.summary;
                    if (typeof summary === "string") {
                        description = summary;
                    } else if (summary && typeof summary === "object") {
                        description = `Evaluation complete. Final score: ${Math.round(
                            (summary.final_score || item.final_score) * 100
                        )}%`;
                    }

                    const scaleScore = (s) =>
                        s <= 1 && s > 0 ? s * 100 : s;

                    return {
                        id: item.startup_id,
                        title,
                        description,
                        score: scaleScore(item.final_score || 0),
                        risk_label: item.risk_label,
                        created_at: item.created_at,
                        component_scores: Object.fromEntries(
                            Object.entries(
                                reportJson.component_scores || {}
                            ).map(([k, v]) => [k, scaleScore(v)])
                        ),
                    };
                });

                setReports(formattedReports);
            } catch (err) {
                console.error("Error loading reports:", err);
                setError("Failed to load reports. Please try again.");
            } finally {
                setLoading(false);
            }
        }
        fetchReports();
    }, []);

    return (
        <div className="max-w-6xl mx-auto">
            {/* ── header ──────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between mb-10"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Reports
                    </h1>
                    <p className="text-base text-muted-foreground mt-2">
                        Review your AI-generated evaluation reports.
                    </p>
                </div>
                <Button size="sm" asChild>
                    <Link href="/evaluate">
                        New Evaluation
                    </Link>
                </Button>
            </motion.div>

            {/* ── content ─────────────────────────────── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-7 w-7 animate-spin text-primary mb-4" />
                    <p className="text-base text-muted-foreground">
                        Loading reports…
                    </p>
                </div>
            ) : error ? (
                <div className="py-16 text-center">
                    <p className="text-base text-red-400">{error}</p>
                </div>
            ) : reports.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-base text-muted-foreground mb-4">
                        No reports yet. Submit your first evaluation to get
                        started.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/evaluate">Start Evaluation</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {reports.map((report, index) => (
                        <ReportCard
                            key={report.id + index}
                            report={report}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
