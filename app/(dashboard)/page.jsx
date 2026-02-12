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
    Search,
    Heart,
    BarChart3,
    TrendingUp,
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

/* ── interest row (investor) ─────────────────────────── */
function InterestRow({ startup, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.06 }}
        >
            <Link
                href={`/discover/${startup.id}`}
                className="flex items-center justify-between py-4 group"
            >
                <div className="flex items-center gap-3.5 min-w-0">
                    <Initials name={startup.name} />
                    <div className="min-w-0">
                        <p className="text-base font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {startup.name}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            {startup.sector && <span>{startup.sector}</span>}
                            {startup.sector && startup.stage && <span className="text-border">·</span>}
                            {startup.stage && <span>{startup.stage}</span>}
                        </p>
                    </div>
                </div>
                {startup.raise_amount && (
                    <span className="text-sm text-emerald-400 font-medium">
                        {startup.raise_amount}
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
    const [interests, setInterests] = useState([]);
    const [interestedStartups, setInterestedStartups] = useState([]);
    const [loading, setLoading] = useState(true);

    const userRole = (user?.user_metadata?.role || "investor").toLowerCase();
    const isFounder = userRole === "founder";

    useEffect(() => {
        async function fetchDashboardData() {
            if (!user?.id) return;
            try {
                const supabase = createClient();

                if (isFounder) {
                    // Founders: fetch only THEIR evaluations
                    const { data, error } = await supabase
                        .from("startup_evaluations")
                        .select("*")
                        .eq("user_id", user.id)
                        .order("created_at", { ascending: false });

                    if (error) throw error;
                    setEvaluations(data || []);
                } else {
                    // Investors: fetch their interests + interested startups
                    const { data: interestData, error: intError } = await supabase
                        .from("investor_interests")
                        .select("startup_id, created_at")
                        .eq("user_id", user.id)
                        .order("created_at", { ascending: false });

                    if (intError) throw intError;
                    setInterests(interestData || []);

                    if (interestData && interestData.length > 0) {
                        const ids = interestData.map((i) => i.startup_id);
                        const { data: startupData } = await supabase
                            .from("startups")
                            .select("*")
                            .in("id", ids);

                        setInterestedStartups(startupData || []);
                    }

                    // Also fetch evaluations count for investors
                    const { data: evalData } = await supabase
                        .from("startup_evaluations")
                        .select("*")
                        .eq("user_id", user.id)
                        .order("created_at", { ascending: false });

                    setEvaluations(evalData || []);
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        }
        if (user !== null) fetchDashboardData();
    }, [user, isFounder]);

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

    /* ── FOUNDER DASHBOARD ──────────────────────────────── */
    if (isFounder) {
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
            { label: "My Startups", value: uniqueStartups.toString(), icon: Rocket },
            { label: "Evaluations", value: evaluations.length.toString(), icon: Target },
            { label: "Reports", value: completed.length.toString(), icon: FileText },
            { label: "Avg Score", value: avgScore, icon: Zap },
        ];

        return (
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {greeting}, {name}
                    </h1>
                    <p className="text-base text-muted-foreground mt-2">
                        Here&apos;s an overview of your startup evaluations.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                    {stats.map((s, i) => (
                        <StatBlock key={s.label} label={s.label} value={s.value} icon={s.icon} index={i} />
                    ))}
                </div>

                <div className="grid lg:grid-cols-5 gap-10">
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                Recent Evaluations
                            </h2>
                            <Button variant="ghost" size="sm" className="text-sm text-primary" asChild>
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
                                    <EvaluationRow key={item.id} item={item} index={index} />
                                ))}
                            </div>
                        )}
                    </div>

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
                            <Link href="/evaluate" className="flex items-center justify-between p-5 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors group">
                                <div>
                                    <p className="text-base font-medium text-foreground">New Evaluation</p>
                                    <p className="text-sm text-muted-foreground mt-1">Submit a startup for AI analysis</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <Link href="/startups" className="flex items-center justify-between p-5 rounded-2xl border border-border hover:border-primary/20 transition-colors group">
                                <div>
                                    <p className="text-base font-medium text-foreground">My Startups</p>
                                    <p className="text-sm text-muted-foreground mt-1">Manage your evaluated startups</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <Link href="/reports" className="flex items-center justify-between p-5 rounded-2xl border border-border hover:border-primary/20 transition-colors group">
                                <div>
                                    <p className="text-base font-medium text-foreground">All Reports</p>
                                    <p className="text-sm text-muted-foreground mt-1">Review your past analyses</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    /* ── INVESTOR DASHBOARD ─────────────────────────────── */
    const sectors = new Set(interestedStartups.map((s) => s.sector).filter(Boolean));
    const recentInterests = interestedStartups.slice(0, 5);
    const reportsCount = evaluations.filter((e) => e.final_score).length;

    const investorStats = [
        { label: "Interests", value: interests.length.toString(), icon: Heart },
        { label: "Sectors", value: sectors.size.toString(), icon: BarChart3 },
        { label: "Reports", value: reportsCount.toString(), icon: FileText },
        { label: "Discoveries", value: interestedStartups.length.toString(), icon: TrendingUp },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">
                    {greeting}, {name}
                </h1>
                <p className="text-base text-muted-foreground mt-2">
                    Discover and track startup investment opportunities.
                </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                {investorStats.map((s, i) => (
                    <StatBlock key={s.label} label={s.label} value={s.value} icon={s.icon} index={i} />
                ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                            Recent Interests
                        </h2>
                        <Button variant="ghost" size="sm" className="text-sm text-primary" asChild>
                            <Link href="/interests">View all</Link>
                        </Button>
                    </div>

                    {recentInterests.length === 0 ? (
                        <p className="text-base text-muted-foreground py-10 text-center">
                            No interests yet. Discover startups and save your favorites.
                        </p>
                    ) : (
                        <div className="divide-y divide-border">
                            {recentInterests.map((startup, index) => (
                                <InterestRow key={startup.id} startup={startup} index={index} />
                            ))}
                        </div>
                    )}
                </div>

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
                        <Link href="/discover" className="flex items-center justify-between p-5 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors group">
                            <div>
                                <p className="text-base font-medium text-foreground">Discover Startups</p>
                                <p className="text-sm text-muted-foreground mt-1">Browse evaluated opportunities</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link href="/interests" className="flex items-center justify-between p-5 rounded-2xl border border-border hover:border-primary/20 transition-colors group">
                            <div>
                                <p className="text-base font-medium text-foreground">My Interests</p>
                                <p className="text-sm text-muted-foreground mt-1">Startups you're watching</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link href="/reports" className="flex items-center justify-between p-5 rounded-2xl border border-border hover:border-primary/20 transition-colors group">
                            <div>
                                <p className="text-base font-medium text-foreground">Reports</p>
                                <p className="text-sm text-muted-foreground mt-1">Review evaluation analyses</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
