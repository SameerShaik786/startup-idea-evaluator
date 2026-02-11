"use client";

import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Rocket,
    FileText,
    Target,
    Zap,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    BarChart3,
    Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";


// Stats data
const stats = [
    {
        title: "Total Startups",
        value: "24",
        change: "+3",
        trend: "up",
        icon: Rocket,
    },
    {
        title: "Evaluations",
        value: "156",
        change: "+12",
        trend: "up",
        icon: Target,
    },
    {
        title: "Reports Generated",
        value: "48",
        change: "+5",
        trend: "up",
        icon: FileText,
    },
    {
        title: "Avg Score",
        value: "73.4",
        change: "-2.1",
        trend: "down",
        icon: Zap,
    },
];

// Recent evaluations data
const recentEvaluations = [
    {
        id: 1,
        name: "TechFlow AI",
        logo: null,
        initials: "TF",
        score: 87,
        status: "completed",
        date: "2 hours ago",
    },
    {
        id: 2,
        name: "DataVault Pro",
        logo: null,
        initials: "DV",
        score: 72,
        status: "completed",
        date: "5 hours ago",
    },
    {
        id: 3,
        name: "CloudSync",
        logo: null,
        initials: "CS",
        score: null,
        status: "pending",
        date: "1 day ago",
    },
    {
        id: 4,
        name: "MetaLayer",
        logo: null,
        initials: "ML",
        score: 91,
        status: "completed",
        date: "2 days ago",
    },
];

// Activity feed data
const activities = [
    {
        id: 1,
        action: "Evaluation completed",
        target: "TechFlow AI",
        time: "2 hours ago",
        icon: CheckCircle2,
        iconColor: "text-green-500",
    },
    {
        id: 2,
        action: "Report generated",
        target: "Q4 Portfolio Analysis",
        time: "4 hours ago",
        icon: FileText,
        iconColor: "text-primary",
    },
    {
        id: 3,
        action: "New startup added",
        target: "QuantumLeap",
        time: "1 day ago",
        icon: Rocket,
        iconColor: "text-blue-500",
    },
    {
        id: 4,
        action: "Evaluation pending",
        target: "CloudSync",
        time: "1 day ago",
        icon: AlertCircle,
        iconColor: "text-yellow-500",
    },
];

// Latest evaluation summary
const latestEvaluation = {
    name: "TechFlow AI",
    score: 87,
    market: 82,
    team: 91,
    product: 85,
    traction: 88,
    insight: "Strong founding team with prior exits. Market timing is optimal for AI-native solutions. Consider strategic partnerships with enterprise prospects.",
};

function WelcomeInsightCard({ user }) {
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
    const role = user?.user_metadata?.role || "Investor";
    const name = user?.user_metadata?.name || user?.email?.split("@")[0] || "User";


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="glass-card gradient-border overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                        {/* Welcome Section */}
                        <div className="flex-1 p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                                    Today&apos;s Insight
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">
                                    {greeting}, {name}
                                </h2>
                                <p className="text-muted-foreground mt-1">
                                    Your portfolio is performing <span className="text-green-500 font-medium">12% better</span> than last month
                                </p>
                            </div>
                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <span className="text-muted-foreground">3 evaluations pending</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <span className="text-muted-foreground">2 new reports ready</span>
                                </div>
                            </div>
                        </div>

                        {/* AI Insight Section */}
                        <div className="lg:w-80 p-6 bg-muted/30 border-t lg:border-t-0 lg:border-l border-border">
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">AI Recommendation</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Based on market trends, consider re-evaluating <span className="text-foreground font-medium">CloudSync</span> for updated scoring. SaaS valuations have shifted significantly.
                            </p>
                            <Button variant="link" className="p-0 h-auto mt-3 text-primary text-sm">
                                View analysis <ArrowUpRight className="h-3 w-3 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function LatestEvaluationSummary() {
    const metrics = [
        { label: "Market", value: latestEvaluation.market },
        { label: "Team", value: latestEvaluation.team },
        { label: "Product", value: latestEvaluation.product },
        { label: "Traction", value: latestEvaluation.traction },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            <Card className="glass-card h-full">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Latest Evaluation</CardTitle>
                                <p className="text-sm text-muted-foreground">{latestEvaluation.name}</p>
                            </div>
                        </div>
                        <Badge className="bg-green-500/15 text-green-500 border-green-500/20 text-lg px-3 py-1">
                            {latestEvaluation.score}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Score Breakdown - Simple Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {metrics.map((metric) => (
                            <div key={metric.label} className="p-3 rounded-lg bg-muted/30">
                                <p className="text-xs text-muted-foreground">{metric.label}</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-xl font-semibold">{metric.value}</span>
                                    <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden mb-1.5">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${metric.value}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Insight */}
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex items-start gap-3">
                            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {latestEvaluation.insight}
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/reports">
                            View Full Report <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function StatsCard({ stat, index }) {
    const Icon = stat.icon;
    const isUp = stat.trend === "up";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <Card className="glass-card hover:glow-sm transition-all duration-300 group cursor-pointer h-full">
                <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground font-medium">
                                {stat.title}
                            </p>
                            <p className="text-3xl font-semibold tracking-tight">
                                {stat.value}
                            </p>
                            <div
                                className={cn(
                                    "flex items-center gap-1 text-sm font-medium",
                                    isUp ? "text-green-500" : "text-red-500"
                                )}
                            >
                                {isUp ? (
                                    <TrendingUp className="h-4 w-4" />
                                ) : (
                                    <TrendingDown className="h-4 w-4" />
                                )}
                                {stat.change}
                                <span className="text-muted-foreground font-normal">
                                    this month
                                </span>
                            </div>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                            <Icon className="h-5 w-5" />
                        </motion.div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function getScoreColor(score) {
    if (score >= 80) return "bg-green-500/15 text-green-500 border-green-500/20";
    if (score >= 60) return "bg-yellow-500/15 text-yellow-500 border-yellow-500/20";
    return "bg-red-500/15 text-red-500 border-red-500/20";
}

// Quick actions data
const quickActions = [
    { icon: Zap, label: "New Evaluation", href: "/evaluate", primary: true },
    { icon: Rocket, label: "Add Startup", href: "/startups/new", primary: false },
    { icon: FileText, label: "Generate Report", href: "/reports/new", primary: false },
];

function InvestorDashboard({ user }) {
    return (
        <div className="space-y-6">
            {/* Welcome Insight Card */}
            <WelcomeInsightCard user={user} />

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <StatsCard key={stat.title} stat={stat} index={index} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Latest Evaluation (1/3) */}
                <LatestEvaluationSummary />

                {/* Recent Evaluations (2/3) */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                    >
                        <Card className="glass-card h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium">
                                    Recent Evaluations
                                </CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/startups" className="text-primary">
                                        View all
                                        <ArrowUpRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentEvaluations.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                                            whileHover={{ x: 4, transition: { duration: 0.2 } }}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-border">
                                                    <AvatarImage src={item.logo} alt={item.name} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                                        {item.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {item.date}
                                                    </div>
                                                </div>
                                            </div>
                                            {item.status === "completed" ? (
                                                <Badge
                                                    variant="outline"
                                                    className={cn("font-semibold", getScoreColor(item.score))}
                                                >
                                                    {item.score}/100
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="animate-pulse-subtle">
                                                    Pending
                                                </Badge>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
            >
                <Card className="glass-card">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="font-semibold text-lg">
                                    Ready to evaluate a new startup?
                                </h3>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Get AI-powered insights in minutes
                                </p>
                            </div>
                            <div className="flex gap-3">
                                {quickActions.map((action, index) => (
                                    <motion.div
                                        key={action.label}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            variant={action.primary ? "default" : "outline"}
                                            className={action.primary ? "glow-sm" : ""}
                                            asChild
                                        >
                                            <Link href={action.href}>
                                                <action.icon className="h-4 w-4 mr-2" />
                                                {action.label}
                                            </Link>
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
            >
                <Card className="glass-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {activities.map((activity, index) => {
                                const Icon = activity.icon;
                                return (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                                    >
                                        <div
                                            className={cn(
                                                "p-2 rounded-lg bg-muted shrink-0",
                                                activity.iconColor
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{activity.action}</p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {activity.target}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div >
    );
}

function FounderDashboard({ user }) {
    const founderStats = [
        {
            title: "Profile Views",
            value: "142",
            change: "+12",
            trend: "up",
            icon: Target,
        },
        {
            title: "Pitch Deck Downloads",
            value: "18",
            change: "+3",
            trend: "up",
            icon: FileText,
        },
        {
            title: "Investor Interest",
            value: "High",
            change: "Top 10%",
            trend: "up",
            icon: Zap,
        },
        {
            title: "Overall Score",
            value: "85",
            change: "+2.5",
            trend: "up",
            icon: Rocket,
        },
    ];

    return (
        <div className="space-y-6">
            <WelcomeInsightCard user={user} />

            {/* Founder Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {founderStats.map((stat, index) => (
                    <StatsCard key={stat.title} stat={stat} index={index} />
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main action for Founder */}
                <div className="lg:col-span-2">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>My Startup</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-6 rounded-xl bg-muted/30 border border-border flex flex-col items-center text-center space-y-4">
                                <Rocket className="h-12 w-12 text-primary mb-2" />
                                <h3 className="text-xl font-semibold">Ready to get evaluated?</h3>
                                <p className="text-muted-foreground max-w-md">
                                    Complete your startup profile and upload your pitch deck to get an AI-powered evaluation score.
                                </p>
                                <Button size="lg" className="glow-sm">
                                    Complete Profile
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions for Founder */}
                <div>
                    <Card className="glass-card h-full">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/startups/edit">
                                    <FileText className="h-4 w-4 mr-2" /> Update Pitch Deck
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/startups/team">
                                    <Target className="h-4 w-4 mr-2" /> Manage Team
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const role = user?.user_metadata?.role || "investor";

    if (role === "founder") {
        return <FounderDashboard user={user} />;
    }

    return <InvestorDashboard user={user} />;
}
