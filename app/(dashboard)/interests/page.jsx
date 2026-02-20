"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, ArrowUpRight, X, Heart, HeartOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/* ── stage dot colors ─────────────────────────────────── */
const STAGE_DOT = {
    "Pre-Seed": "bg-violet-400",
    Seed: "bg-sky-400",
    "Series A": "bg-emerald-400",
    "Series B": "bg-amber-400",
    "Series C": "bg-rose-400",
};

/* ── helpers ──────────────────────────────────────────── */
function Initials({ name }) {
    const letters = (name || "S")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-border flex items-center justify-center select-none shrink-0">
            <span className="font-semibold text-lg tracking-tight text-primary">
                {letters}
            </span>
        </div>
    );
}

/* ── startup card ─────────────────────────────────────── */
function StartupCard({ startup, index, onRemoveInterest }) {
    const dot = STAGE_DOT[startup.stage] || "bg-muted-foreground";

    const handleRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemoveInterest?.(startup.id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full"
        >
            <Link href={`/discover/${startup.id}`} className="block group h-full">
                <div className="flex flex-col h-full p-6 rounded-2xl border border-border hover:border-primary/30 transition-all duration-200 bg-transparent">
                    {/* top row — logo · name · stage */}
                    <div className="flex items-start gap-4 mb-4">
                        {startup.logo_url ? (
                            <img
                                src={startup.logo_url}
                                alt={startup.name}
                                className="h-14 w-14 rounded-2xl object-cover border border-border shrink-0"
                            />
                        ) : (
                            <Initials name={startup.name} />
                        )}

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                                    {startup.name}
                                </h3>
                                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>

                            {/* meta line: stage · sector */}
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                {startup.stage && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className={`h-2 w-2 rounded-full ${dot}`} />
                                        {startup.stage}
                                    </span>
                                )}
                                {startup.stage && startup.sector && (
                                    <span className="text-border">·</span>
                                )}
                                {startup.sector && (
                                    <span>{startup.sector}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* tagline — flex-1 to push footer down */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                        {startup.tagline || "No description available."}
                    </p>

                    {/* bottom row */}
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-border/50">
                        {startup.raise_amount ? (
                            <span className="text-emerald-400 font-medium">
                                Raising {startup.raise_amount}
                            </span>
                        ) : (
                            <span className="text-muted-foreground text-xs">
                                Added {new Date(startup.created_at).toLocaleDateString()}
                            </span>
                        )}

                        <button
                            onClick={handleRemove}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
                        >
                            <HeartOff className="h-3.5 w-3.5" />
                            Remove
                        </button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

/* ── page ─────────────────────────────────────────────── */
export default function InterestsPage() {
    const { user } = useAuth();
    const [startups, setStartups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchInterests = async () => {
        if (!user?.id) return;
        try {
            const supabase = createClient();

            // Fetch interests with joined startup data
            const { data: interestData, error: interestError } = await supabase
                .from("investor_interests")
                .select("startup_id, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (interestError) throw interestError;

            if (!interestData || interestData.length === 0) {
                setStartups([]);
                setLoading(false);
                return;
            }

            // Fetch the actual startup data
            const startupIds = interestData.map((i) => i.startup_id);
            const { data: startupData, error: startupError } = await supabase
                .from("startups")
                .select("id, name, tagline, stage, sector, logo_url, raise_amount, created_at")
                .in("id", startupIds);

            if (startupError) throw startupError;
            setStartups(startupData || []);
        } catch (err) {
            console.error("Error fetching interests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user !== null) fetchInterests();
    }, [user]);

    const handleRemoveInterest = async (startupId) => {
        if (!user?.id) return;

        // Optimistic removal
        setStartups((prev) => prev.filter((s) => s.id !== startupId));

        try {
            const supabase = createClient();
            await supabase
                .from("investor_interests")
                .delete()
                .eq("user_id", user.id)
                .eq("startup_id", startupId);
        } catch (err) {
            console.error("Error removing interest:", err);
            // Re-fetch on error
            fetchInterests();
        }
    };

    const filteredStartups = useMemo(() => {
        if (!searchQuery.trim()) return startups;
        const q = searchQuery.toLowerCase();
        return startups.filter(
            (s) =>
                s.name?.toLowerCase().includes(q) ||
                s.sector?.toLowerCase().includes(q) ||
                s.tagline?.toLowerCase().includes(q)
        );
    }, [startups, searchQuery]);

    /* ── loading ──────────────────────────────────────── */
    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading your interests…</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* ── page header ─────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-10"
            >
                <h1 className="text-3xl font-bold tracking-tight">Interests</h1>
                <p className="text-base text-muted-foreground mt-2">
                    Startups you've expressed interest in. Manage your watchlist.
                </p>
            </motion.div>

            {/* ── search ──────────────────────────────── */}
            {startups.length > 0 && (
                <div className="flex items-center gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search your interests…"
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
            )}

            {/* ── grid ────────────────────────────────── */}
            {filteredStartups.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredStartups.map((startup, index) => (
                        <StartupCard
                            key={startup.id}
                            startup={startup}
                            index={index}
                            onRemoveInterest={handleRemoveInterest}
                        />
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center"
                >
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mb-4">
                        <Heart className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-base text-muted-foreground mb-1">
                        {searchQuery ? "No interests match your search." : "No interests yet."}
                    </p>
                    {!searchQuery && (
                        <>
                            <p className="text-sm text-muted-foreground mb-4">
                                Discover startups and click the heart button to save them here.
                            </p>
                            <Button variant="outline" asChild>
                                <Link href="/discover">Browse Startups</Link>
                            </Button>
                        </>
                    )}
                </motion.div>
            )}
        </div>
    );
}
