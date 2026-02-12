"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/* ── helpers ─────────────────────────────────────────── */
const STAGE_ACCENT = {
    "Pre-Seed": { dot: "bg-violet-400", text: "text-violet-400" },
    Seed: { dot: "bg-sky-400", text: "text-sky-400" },
    "Series A": { dot: "bg-emerald-400", text: "text-emerald-400" },
    "Series B": { dot: "bg-amber-400", text: "text-amber-400" },
    "Series C": { dot: "bg-rose-400", text: "text-rose-400" },
};

function Initials({ name }) {
    const letters = (name || "S")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="h-[72px] w-[72px] rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-border flex items-center justify-center select-none">
            <span className="text-2xl font-bold tracking-tight text-primary">
                {letters}
            </span>
        </div>
    );
}

/* ── page ─────────────────────────────────────────────── */
export default function StartupDetailPage() {
    const { startup_id } = useParams();
    const router = useRouter();
    const [startup, setStartup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchStartup() {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("startups")
                    .select("*")
                    .eq("id", startup_id)
                    .single();

                if (error) throw error;
                setStartup(data);
            } catch (err) {
                console.error("Error fetching startup:", err);
                setError("Startup not found");
            } finally {
                setLoading(false);
            }
        }
        if (startup_id) fetchStartup();
    }, [startup_id]);

    /* ── loading ──────────────────────────────────────── */
    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading profile…</p>
            </div>
        );
    }

    /* ── error / not found ────────────────────────────── */
    if (error || !startup) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <h2 className="text-lg font-semibold text-foreground mb-1">
                    Startup not found
                </h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                    The profile you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/discover")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Discover
                </Button>
            </div>
        );
    }

    const stage = STAGE_ACCENT[startup.stage] || {
        dot: "bg-muted-foreground",
        text: "text-muted-foreground",
    };

    /* ── render ────────────────────────────────────────── */
    return (
        <article className="max-w-2xl mx-auto pb-20">
            {/* ── breadcrumb ──────────────────────────── */}
            <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-10"
            >
                <button
                    onClick={() => router.push("/discover")}
                    className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Discover
                </button>
            </motion.nav>

            {/* ════════════════════════════════════════════
                HEADER — Logo · Name · Tagline · Meta
            ════════════════════════════════════════════ */}
            <motion.header
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="mb-14"
            >
                <div className="flex items-start gap-5">
                    {/* Logo */}
                    {startup.logo_url ? (
                        <img
                            src={startup.logo_url}
                            alt={startup.name}
                            className="h-[72px] w-[72px] rounded-2xl object-cover border border-border shrink-0"
                        />
                    ) : (
                        <Initials name={startup.name} />
                    )}

                    <div className="min-w-0 pt-0.5">
                        {/* Name */}
                        <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-tight text-foreground">
                            {startup.name}
                        </h1>

                        {/* Tagline */}
                        {startup.tagline && (
                            <p className="mt-1.5 text-[15px] sm:text-base leading-relaxed text-muted-foreground">
                                {startup.tagline}
                            </p>
                        )}

                        {/* Meta pills — stage · sector · raise · website */}
                        <div className="flex items-center gap-3 mt-4 flex-wrap text-[13px]">
                            {startup.stage && (
                                <span className="inline-flex items-center gap-1.5 text-secondary-foreground">
                                    <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} />
                                    {startup.stage}
                                </span>
                            )}

                            {startup.stage && startup.sector && (
                                <span className="text-border">·</span>
                            )}

                            {startup.sector && (
                                <span className="text-secondary-foreground">
                                    {startup.sector}
                                </span>
                            )}

                            {startup.raise_amount && (
                                <>
                                    <span className="text-border">·</span>
                                    <span className="text-emerald-400 font-medium">
                                        Raising {startup.raise_amount}
                                    </span>
                                </>
                            )}

                            {startup.website && (
                                <>
                                    <span className="text-border">·</span>
                                    <a
                                        href={startup.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Website
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* ════════════════════════════════════════════
                ABOUT THE COMPANY
            ════════════════════════════════════════════ */}
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="mb-12"
            >
                <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
                    About the Company
                </h2>
                <div className="border-l-2 border-border pl-5">
                    <p className="text-[15px] sm:text-base leading-[1.8] text-foreground/85">
                        {startup.about || "No company description available."}
                    </p>
                </div>
            </motion.section>

            {/* ════════════════════════════════════════════
                THE IDEA
            ════════════════════════════════════════════ */}
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                className="mb-16"
            >
                <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
                    The Idea
                </h2>
                <div className="border-l-2 border-border pl-5">
                    <p className="text-[15px] sm:text-base leading-[1.8] text-foreground/85">
                        {startup.product || "No product or idea details available."}
                    </p>
                </div>
            </motion.section>

            {/* ═══════════════════════════════════════════
                CTA — View Full Evaluation Report
            ═══════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative"
            >
                {/* subtle divider */}
                <div className="absolute -top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Ready to go deeper?
                        </p>
                        <p className="text-[13px] text-muted-foreground mt-0.5">
                            Our AI agents have analyzed this startup across 7&nbsp;investment domains.
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="group px-7 py-5 text-[15px] font-medium"
                        asChild
                    >
                        <Link href={`/reports/${startup.id}`}>
                            View Full Evaluation Report
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </article>
    );
}
