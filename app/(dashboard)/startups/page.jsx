"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Clock,
    Loader2,
    ArrowUpRight,
    X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
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
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-border flex items-center justify-center select-none shrink-0">
            <span className="text-sm font-semibold text-primary">{letters}</span>
        </div>
    );
}

/* ── startup card ─────────────────────────────────────── */
function StartupCard({ startup, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full"
        >
            <Link href={`/reports/${startup.id}`} className="block group h-full">
                <div className="flex flex-col h-full p-6 rounded-2xl border border-border hover:border-primary/30 bg-transparent transition-all duration-200">
                    {/* top row */}
                    <div className="flex items-start gap-4 mb-3">
                        <Initials name={startup.name} />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                                    {startup.name}
                                </h3>
                                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>

                            {/* meta */}
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                {startup.sector && <span>{startup.sector}</span>}
                                {startup.sector && startup.stage && <span className="text-border">·</span>}
                                {startup.stage && <span>{startup.stage}</span>}
                            </div>
                        </div>
                    </div>

                    {/* description — flex-1 pushes bottom row down */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                        {startup.description}
                    </p>

                    {/* bottom row — date · score */}
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-border/50">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {startup.lastEvaluated}
                        </span>
                        {startup.score > 0 && (
                            <span className={cn("text-lg font-bold tabular-nums", getScoreColor(startup.score))}>
                                {Math.round(startup.score)}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

/* ── page ─────────────────────────────────────────────── */
export default function StartupsPage() {
    const { user } = useAuth();
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [startupNameMap, setStartupNameMap] = useState({});

    useEffect(() => {
        async function fetchStartups() {
            try {
                const supabase = createClient();

                // Build evaluations query
                let evalQuery = supabase
                    .from("startup_evaluations")
                    .select("id, startup_id, final_score, created_at, user_id")
                    .order("created_at", { ascending: false });

                if (user?.id) {
                    evalQuery = evalQuery.eq("user_id", user.id);
                }

                // Run BOTH queries in parallel
                const [evalResult, startupResult] = await Promise.all([
                    evalQuery,
                    supabase.from("startups").select("id, name, description"),
                ]);

                if (evalResult.error) throw evalResult.error;
                setEvaluations(evalResult.data || []);

                // Build name map from startups
                const map = {};
                (startupResult.data || []).forEach(s => {
                    map[s.id] = { name: s.name, description: s.description };
                });
                setStartupNameMap(map);
            } catch (err) {
                console.error("Error fetching startups:", err);
            } finally {
                setLoading(false);
            }
        }
        if (user !== null) fetchStartups();
    }, [user]);

    const role = user?.user_metadata?.role || "investor";
    const isFounder = role === "founder";

    // Group evaluations by startup_id and take the latest
    const uniqueStartups = useMemo(() => {
        const startupMap = new Map();
        evaluations.forEach(item => {
            if (!startupMap.has(item.startup_id)) {
                const startupInfo = startupNameMap[item.startup_id];
                const name = startupInfo?.name || item.startup_id || "Unknown";
                const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                const summary = startupInfo?.description || "No summary available.";

                startupMap.set(item.startup_id, {
                    id: item.startup_id,
                    name: name,
                    description: summary,
                    initials: initials,
                    score: item.final_score || 0,
                    sector: "Tech",
                    stage: "Early",
                    lastEvaluated: new Date(item.created_at).toLocaleDateString(),
                });
            }
        });
        return Array.from(startupMap.values());
    }, [evaluations, startupNameMap]);

    const filteredStartups = useMemo(() => {
        if (!searchQuery.trim()) return uniqueStartups;
        const q = searchQuery.toLowerCase();
        return uniqueStartups.filter(
            (startup) =>
                startup.name.toLowerCase().includes(q) ||
                startup.description.toLowerCase().includes(q) ||
                startup.sector.toLowerCase().includes(q)
        );
    }, [uniqueStartups, searchQuery]);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary mb-4" />
                <p className="text-base text-muted-foreground">Loading startups…</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* header */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-10"
            >
                <h1 className="text-3xl font-bold tracking-tight">
                    My Startups
                </h1>
                <p className="text-base text-muted-foreground mt-2">
                    Manage your startup evaluations
                </p>
            </motion.div>

            {/* search */}
            <div className="flex items-center gap-3 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search startups..."
                        className="pl-11 h-12 text-base border-border rounded-xl bg-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredStartups.map((startup, index) => (
                    <StartupCard key={startup.id} startup={startup} index={index} />
                ))}
            </div>

            {/* empty */}
            {filteredStartups.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center"
                >
                    <p className="text-base text-muted-foreground">
                        No startups found matching your search.
                    </p>
                    <Button variant="outline" className="mt-4" asChild>
                        <Link href="/evaluate">Start Evaluation</Link>
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
