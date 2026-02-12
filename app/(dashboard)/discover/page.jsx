"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, ArrowUpRight, X, Heart, ExternalLink } from "lucide-react";
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
function StartupCard({ startup, index, isInvestor, isInterested, onToggleInterest }) {
    const dot = STAGE_DOT[startup.stage] || "bg-muted-foreground";

    const handleInterestClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleInterest?.(startup.id);
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
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3 flex-1">
                        {startup.tagline || "No description available."}
                    </p>

                    {/* website link */}
                    {startup.website && (
                        <a
                            href={startup.website.startsWith("http") ? startup.website : `https://${startup.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors mb-3 truncate"
                        >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            <span className="truncate">{startup.website.replace(/^https?:\/\//, "")}</span>
                        </a>
                    )}

                    {/* bottom row — raise amount · interest button */}
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-border/50">
                        {startup.raise_amount ? (
                            <span className="text-emerald-400 font-medium">
                                Raising {startup.raise_amount}
                            </span>
                        ) : startup.trending ? (
                            <span className="text-amber-400/80 font-medium">
                                Trending
                            </span>
                        ) : (
                            <span />
                        )}

                        {isInvestor && (
                            <button
                                onClick={handleInterestClick}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                                    isInterested
                                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
                                        : "bg-muted/50 text-muted-foreground border border-border hover:text-foreground hover:border-foreground/30"
                                )}
                            >
                                <Heart className={cn("h-3.5 w-3.5", isInterested && "fill-rose-400")} />
                                {isInterested ? "Interested" : "Interest"}
                            </button>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

/* ── page ─────────────────────────────────────────────── */
export default function DiscoverPage() {
    const { user } = useAuth();
    const [startups, setStartups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStage, setSelectedStage] = useState(null);
    const [interests, setInterests] = useState(new Set());

    const isInvestor = (user?.user_metadata?.role || "investor") === "investor";

    useEffect(() => {
        async function fetchData() {
            try {
                const supabase = createClient();

                // Fetch all startups
                const { data, error } = await supabase
                    .from("startups")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setStartups(data || []);

                // If investor, also fetch their interests
                if (isInvestor && user?.id) {
                    const { data: interestData } = await supabase
                        .from("investor_interests")
                        .select("startup_id")
                        .eq("user_id", user.id);

                    if (interestData) {
                        setInterests(new Set(interestData.map((i) => i.startup_id)));
                    }
                }
            } catch (err) {
                console.error("Error fetching startups:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user, isInvestor]);

    const handleToggleInterest = async (startupId) => {
        if (!user?.id) return;

        const supabase = createClient();
        const isCurrentlyInterested = interests.has(startupId);

        // Optimistic update
        setInterests((prev) => {
            const next = new Set(prev);
            if (isCurrentlyInterested) {
                next.delete(startupId);
            } else {
                next.add(startupId);
            }
            return next;
        });

        try {
            if (isCurrentlyInterested) {
                await supabase
                    .from("investor_interests")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("startup_id", startupId);
            } else {
                await supabase
                    .from("investor_interests")
                    .insert({ user_id: user.id, startup_id: startupId });
            }
        } catch (err) {
            console.error("Error toggling interest:", err);
            // Revert optimistic update
            setInterests((prev) => {
                const next = new Set(prev);
                if (isCurrentlyInterested) {
                    next.add(startupId);
                } else {
                    next.delete(startupId);
                }
                return next;
            });
        }
    };

    const stages = useMemo(() => {
        const set = new Set(startups.map((s) => s.stage).filter(Boolean));
        return Array.from(set).sort();
    }, [startups]);

    const filteredStartups = useMemo(() => {
        let result = startups;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (s) =>
                    s.name?.toLowerCase().includes(q) ||
                    s.sector?.toLowerCase().includes(q) ||
                    s.tagline?.toLowerCase().includes(q)
            );
        }

        if (selectedStage) {
            result = result.filter((s) => s.stage === selectedStage);
        }

        return result;
    }, [startups, searchQuery, selectedStage]);

    const trendingStartups = filteredStartups.filter((s) => s.trending);
    const allStartups = filteredStartups;

    /* ── loading ──────────────────────────────────────── */
    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Discovering startups…</p>
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
                <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
                <p className="text-base text-muted-foreground mt-2">
                    Explore evaluated startups and find your next investment opportunity.
                </p>
            </motion.div>

            {/* ── search + filter ─────────────────────── */}
            <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, sector, or keyword…"
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

            {/* ── stage filter pills ──────────────────── */}
            {stages.length > 0 && (
                <div className="flex items-center gap-2.5 mb-10 flex-wrap">
                    <button
                        onClick={() => setSelectedStage(null)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${selectedStage === null
                            ? "bg-foreground text-background border-foreground"
                            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                            }`}
                    >
                        All
                    </button>
                    {stages.map((stage) => (
                        <button
                            key={stage}
                            onClick={() =>
                                setSelectedStage(
                                    selectedStage === stage ? null : stage
                                )
                            }
                            className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${selectedStage === stage
                                ? "bg-foreground text-background border-foreground"
                                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                                }`}
                        >
                            {stage}
                        </button>
                    ))}
                </div>
            )}

            {/* ── trending ────────────────────────────── */}
            {trendingStartups.length > 0 && !searchQuery && !selectedStage && (
                <section className="mb-12">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-5">
                        Trending Now
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {trendingStartups.map((startup, index) => (
                            <StartupCard
                                key={startup.id}
                                startup={startup}
                                index={index}
                                isInvestor={isInvestor}
                                isInterested={interests.has(startup.id)}
                                onToggleInterest={handleToggleInterest}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ── all startups ────────────────────────── */}
            <section>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        {searchQuery || selectedStage ? "Results" : "All Startups"}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                        {allStartups.length}{" "}
                        {allStartups.length === 1 ? "startup" : "startups"}
                    </span>
                </div>

                {allStartups.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 text-center"
                    >
                        <p className="text-base text-muted-foreground">
                            No startups found. Try adjusting your search or filters.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {allStartups.map((startup, index) => (
                            <StartupCard
                                key={startup.id}
                                startup={startup}
                                index={index}
                                isInvestor={isInvestor}
                                isInterested={interests.has(startup.id)}
                                onToggleInterest={handleToggleInterest}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
