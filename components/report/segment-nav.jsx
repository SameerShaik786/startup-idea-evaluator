"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SEGMENTS = [
    { id: "overview", label: "Overview" },
    { id: "validation", label: "Validation" },
    { id: "financial", label: "Financial" },
    { id: "market", label: "Market" },
    { id: "competition", label: "Competition" },
    { id: "risk", label: "Risk" },
    { id: "longevity", label: "Longevity" },
    { id: "investor-fit", label: "Investor Fit" },
];

export function SegmentNav({ activeSegment, onSelect }) {
    return (
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
            <div className="max-w-7xl mx-auto px-4 md:px-0">
                <nav className="flex overflow-x-auto no-scrollbar py-2 gap-1">
                    {SEGMENTS.map((segment) => (
                        <button
                            key={segment.id}
                            onClick={() => onSelect(segment.id)}
                            className={cn(
                                "relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-md",
                                activeSegment === segment.id
                                    ? "text-foreground bg-white/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            {segment.label}
                            {activeSegment === segment.id && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}
