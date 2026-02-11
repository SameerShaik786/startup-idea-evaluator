"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Filter,
    Grid3x3,
    List,
    MoreVertical,
    TrendingUp,
    TrendingDown,
    ExternalLink,
    Trash2,
    Edit,
    Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

// Sample startups data
const startups = [
    {
        id: 1,
        name: "TechFlow AI",
        description: "AI-powered workflow automation for enterprises",
        initials: "TF",
        score: 87,
        previousScore: 82,
        stage: "Series A",
        sector: "AI/ML",
        lastEvaluated: "2 hours ago",
        founded: "2023",
    },
    {
        id: 2,
        name: "DataVault Pro",
        description: "Enterprise data security and compliance platform",
        initials: "DV",
        score: 72,
        previousScore: 75,
        stage: "Seed",
        sector: "Security",
        lastEvaluated: "5 hours ago",
        founded: "2024",
    },
    {
        id: 3,
        name: "MetaLayer",
        description: "Next-gen infrastructure layer for Web3",
        initials: "ML",
        score: 91,
        previousScore: 88,
        stage: "Series B",
        sector: "Web3",
        lastEvaluated: "2 days ago",
        founded: "2022",
    },
    {
        id: 4,
        name: "CloudSync",
        description: "Seamless multi-cloud synchronization",
        initials: "CS",
        score: 68,
        previousScore: 68,
        stage: "Seed",
        sector: "Cloud",
        lastEvaluated: "3 days ago",
        founded: "2024",
    },
    {
        id: 5,
        name: "QuantumLeap",
        description: "Quantum computing solutions for finance",
        initials: "QL",
        score: 94,
        previousScore: 90,
        stage: "Series A",
        sector: "Quantum",
        lastEvaluated: "1 week ago",
        founded: "2023",
    },
    {
        id: 6,
        name: "BioNex",
        description: "AI-driven drug discovery platform",
        initials: "BN",
        score: 79,
        previousScore: 76,
        stage: "Series A",
        sector: "Biotech",
        lastEvaluated: "1 week ago",
        founded: "2022",
    },
];

function getScoreColor(score) {
    if (score >= 80) return "bg-green-500/15 text-green-500 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/15 text-yellow-500 border-yellow-500/30";
    return "bg-red-500/15 text-red-500 border-red-500/30";
}

function getScoreTrend(current, previous) {
    if (current > previous) return { icon: TrendingUp, color: "text-green-500" };
    if (current < previous) return { icon: TrendingDown, color: "text-red-500" };
    return null;
}

function StartupCard({ startup, index, viewMode }) {
    const trend = getScoreTrend(startup.score, startup.previousScore);
    const TrendIcon = trend?.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card className="glass-card hover:glow-sm transition-all duration-300 group cursor-pointer h-full">
                <CardContent className={cn("p-5 h-full", viewMode === "list" ? "flex items-center gap-6" : "flex flex-col")}>
                    <div className={cn("flex items-start gap-4", viewMode === "list" && "flex-1")}>
                        <Avatar className="h-12 w-12 border border-border">
                            <AvatarImage src={startup.logo} alt={startup.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {startup.initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                                        {startup.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                        {startup.description}
                                    </p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {viewMode === "grid" && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <Badge variant="secondary" className="text-xs">
                                        {startup.sector}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {startup.stage}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {viewMode === "list" && (
                        <>
                            <div className="flex gap-2">
                                <Badge variant="secondary" className="text-xs">
                                    {startup.sector}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {startup.stage}
                                </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {startup.lastEvaluated}
                            </div>
                        </>
                    )}

                    <div className={cn("flex items-center justify-between", viewMode === "grid" && "mt-auto pt-4 border-t border-border/50")}>
                        {viewMode === "grid" && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {startup.lastEvaluated}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {trend && <TrendIcon className={cn("h-4 w-4", trend.color)} />}
                            <Badge
                                variant="outline"
                                className={cn("font-bold text-sm px-3", getScoreColor(startup.score))}
                            >
                                {startup.score}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function StartupsPage() {
    const { user } = useAuth();
    const role = user?.user_metadata?.role || "investor";
    const isFounder = role === "founder";

    const [viewMode, setViewMode] = useState("grid");
    const [searchQuery, setSearchQuery] = useState("");

    // If founder, only show their startup (mocked as the first one)
    const displayedStartups = isFounder ? [startups[0]] : startups;

    const filteredStartups = displayedStartups.filter(
        (startup) =>
            startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            startup.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            startup.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-2xl font-semibold tracking-tight">
                    {isFounder ? "My Startup" : "Portfolio"}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {isFounder ? "Manage your startup profile and fundraising" : "Track and manage your startup portfolio"}
                </p>
            </motion.div>

            {/* Toolbar - Only show search/filter for investors or if there are multiple */}
            {!isFounder && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search startups..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-1 border border-border rounded-lg p-1">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewMode("grid")}
                        >
                            <Grid3x3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Startups Grid/List */}
            <div
                className={cn(
                    viewMode === "grid"
                        ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                        : "flex flex-col gap-3"
                )}
            >
                {filteredStartups.map((startup, index) => (
                    <StartupCard key={startup.id} startup={startup} index={index} viewMode={viewMode} />
                ))}
            </div>

            {/* Empty State */}
            {filteredStartups.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                >
                    <p className="text-muted-foreground">No startups found matching your search.</p>
                </motion.div>
            )}
        </div>
    );
}
