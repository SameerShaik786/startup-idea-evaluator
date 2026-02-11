"use client";

import { motion } from "framer-motion";
import { Search, Rocket, TrendingUp, Sparkles, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const featuredStartups = [
    {
        id: 1,
        name: "Nebula AI",
        description: "Generative AI for pharmaceutical drug discovery",
        sector: "HealthTech",
        stage: "Series A",
        raise: "$5M",
        trending: true,
    },
    {
        id: 2,
        name: "GreenGrid",
        description: "Decentralized energy trading platform for solar households",
        sector: "CleanTech",
        stage: "Seed",
        raise: "$1.2M",
        trending: true,
    },
    {
        id: 3,
        name: "SecureChain",
        description: "Enterprise blockchain security for supply chain logistics",
        sector: "FinTech",
        stage: "Series B",
        raise: "$12M",
        trending: false,
    },
];

export default function DiscoverPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
                    <p className="text-muted-foreground mt-2">
                        Find the next unicorn. AI-curated investment opportunities tailored to your thesis.
                    </p>
                </div>
                <Button className="glow-sm">
                    <Sparkles className="h-4 w-4 mr-2" /> AI Match
                </Button>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by sector, stage, or keyword..."
                        className="pl-10 bg-background/50 border-input"
                    />
                </div>
                <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" /> Filters
                </Button>
            </div>

            {/* Featured Section */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Trending Now</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {featuredStartups.map((startup, index) => (
                        <motion.div
                            key={startup.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="glass-card hover:border-primary/50 transition-all cursor-pointer group h-full">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                                            <Rocket className="h-6 w-6 text-primary" />
                                        </div>
                                        {startup.trending && (
                                            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                                                Trending
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="mt-4">{startup.name}</CardTitle>
                                    <CardDescription>{startup.sector} • {startup.stage}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {startup.description}
                                    </p>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span>Raising {startup.raise}</span>
                                        <Button variant="link" asChild className="p-0 h-auto">
                                            <Link href={`/startups/${startup.id}`}>View Details</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
