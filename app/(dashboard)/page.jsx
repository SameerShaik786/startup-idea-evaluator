"use client";

import { motion } from "framer-motion";
import {
    Rocket,
    FileText,
    Target,
    Zap,
    ArrowRight,
    Clock,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

/* ── helpers ──────────────────────────────────────────── */
function getScoreColor(score) {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
}

function Initials({ name }) {
    const letters = (name || "S")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-border flex items-center justify-center select-none shrink-0">
            <span className="text-sm font-semibold text-primary">{letters}</span>
        </div>
    );
}

/* ── stat card ────────────────────────────────────────── */
function StatBlock({ label, value, icon: Icon, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 * index, ease: [0.25, 0.1, 0.25, 1] }}
            className="p-6 rounded-2xl border border-border bg-transparent"
        >
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {label}
                </span>
                <Icon className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="text-3xl font-bold tracking-tight text-foreground">
                {value}
            </p>
        </motion.div>
    );
}

/* ── recent row ───────────────────────────────────────── */
function EvaluationRow({ item, index }) {
    const reportJson = item.report_json || {};
    const name =
        reportJson.startup_name || item.startup_id || "Unknown Startup";
    const score = item.final_score ? Math.round(item.final_score) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.06 }}
        >
            <Link
                href={`/reports/${item.startup_id}`}
                className="flex items-center justify-between py-4 group"
            >
                <div className="flex items-center gap-3.5 min-w-0">
                    <Initials name={name} />
                    <div className="min-w-0">
                        <p className="text-base font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {name}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(item.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                {score !== null ? (
                    <span
                        className={cn(
                            "text-lg font-bold tabular-nums",
                            getScoreColor(score)
                        )}
                    >
                        {score}
                    </span>
                ) : (
                    <span className="text-sm text-muted-foreground">
                        Pending
                    </span>
                )}
            </Link>
        </motion.div>
    );
}

/* ── main ─────────────────────────────────────────────── */
export default function DashboardPage() {
    const { user } = useAuth();
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("startup_evaluations")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setEvaluations(data || []);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary mb-4" />
                <p className="text-base text-muted-foreground">
                    Loading dashboard…
                </p>
            </div>
        );
    }

    const name =
        user?.user_metadata?.name || user?.email?.split("@")[0] || "there";
    const currentHour = new Date().getHours();
    const greeting =
        currentHour < 12
            ? "Good morning"
            : currentHour < 18
                ? "Good afternoon"
                : "Good evening";

    const completed = evaluations.filter((e) => e.final_score);
    const uniqueStartups = new Set(evaluations.map((e) => e.startup_id)).size;
    const avgScore =
        completed.length > 0
            ? (
                completed.reduce(
                    (acc, curr) => acc + Number(curr.final_score),
                    0
                ) / completed.length
            ).toFixed(0)
            : "—";

    const recentEvaluations = evaluations.slice(0, 5);

    const stats = [
        { label: "Startups", value: uniqueStartups.toString(), icon: Rocket },
        {
            label: "Evaluations",
            value: evaluations.length.toString(),
            icon: Target,
        },
        {
            label: "Reports",
            value: completed.length.toString(),
            icon: FileText,
        },
        { label: "Avg Score", value: avgScore, icon: Zap },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            {/* ── welcome ─────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-10"
            >
                <h1 className="text-3xl font-bold tracking-tight">
                    {greeting}, {name}
                </h1>
                <p className="text-base text-muted-foreground mt-2">
                    Here&apos;s an overview of your investment evaluations.
                </p>
            </motion.div>

            {/* ── stats ───────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                {stats.map((s, i) => (
                    <StatBlock
                        key={s.label}
                        label={s.label}
                        value={s.value}
                        icon={s.icon}
                        index={i}
                    />
                ))}
            </div>

            {/* ── two-column: recent + CTA ────────────── */}
            <div className="grid lg:grid-cols-5 gap-10">
                {/* recent evaluations */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                            Recent Evaluations
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm text-primary"
                            asChild
                        >
                            <Link href="/reports">View all</Link>
                        </Button>
                    </div>

                    {recentEvaluations.length === 0 ? (
                        <p className="text-base text-muted-foreground py-10 text-center">
                            No evaluations yet. Submit your first startup.
                        </p>
                    ) : (
                        <div className="divide-y divide-border">
                            {recentEvaluations.map((item, index) => (
                                <EvaluationRow
                                    key={item.id}
                                    item={item}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* quick actions */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="lg:col-span-2"
                >
                    <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-5">
                        Quick Actions
                    </h2>

                    <div className="space-y-3">
                        <Link
                            href="/evaluate"
                            className="flex items-center justify-between p-5 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors group"
                        >
                            <div>
                                <p className="text-base font-medium text-foreground">
                                    New Evaluation
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Submit a startup for AI analysis
                                </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        <Link
                            href="/discover"
                            className="flex items-center justify-between p-5 rounded-2xl border border-border hover:border-primary/20 transition-colors group"
                        >
                            <div>
                                <p className="text-base font-medium text-foreground">
                                    Discover Startups
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Browse evaluated opportunities
                                </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        <Link
                            href="/reports"
                            className="flex items-center justify-between p-5 rounded-2xl border border-border hover:border-primary/20 transition-colors group"
                        >
                            <div>
                                <p className="text-base font-medium text-foreground">
                                    All Reports
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Review past analyses
                                </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
