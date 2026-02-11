"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    Download,
    Share2,
    Calendar,
    TrendingUp,
    BarChart3,
    PieChart,
    Eye,
    MoreVertical,
    AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function getReportTypeStyles(type) {
    switch (type) {
        case "portfolio":
            return "bg-primary/10 text-primary";
        case "startup":
            return "bg-blue-500/10 text-blue-500";
        case "market":
            return "bg-green-500/10 text-green-500";
        default:
            return "bg-muted text-muted-foreground";
    }
}

function ReportCard({ report, index }) {
    // Default to 'startup' type for now as that's what we're saving
    const type = report.type || "startup";
    const Icon = type === "portfolio" ? PieChart : type === "market" ? TrendingUp : BarChart3;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card className="glass-card hover:glow-sm transition-all duration-300 group">
                <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                        <div
                            className={cn(
                                "p-3 rounded-lg transition-colors",
                                getReportTypeStyles(type)
                            )}
                        >
                            <Icon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                                        {report.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                        {report.description || `Evaluation for ${report.title}`}
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
                                        <DropdownMenuItem asChild>
                                            <Link href={`/reports/${report.id}`}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Report
                                            </Link>
                                        </DropdownMenuItem>
                                        {/* 
                                        <DropdownMenuItem>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download PDF
                                        </DropdownMenuItem> 
                                        */}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex items-center gap-3 mt-4 flex-wrap">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(report.created_at).toLocaleDateString()}
                                </div>

                                {report.score !== undefined && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-xs font-semibold",
                                            report.score >= 80
                                                ? "bg-green-500/15 text-green-500 border-green-500/30"
                                                : report.score >= 60
                                                    ? "bg-yellow-500/15 text-yellow-500 border-yellow-500/30"
                                                    : "bg-red-500/15 text-red-500 border-red-500/30"
                                        )}
                                    >
                                        Score: {Math.round(report.score)}
                                    </Badge>
                                )}

                                {report.risk_label && (
                                    <Badge variant="secondary" className="text-xs">
                                        {report.risk_label.replace("_", " ")}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchReports() {
            try {
                const supabase = createClient();
                // Fetch from the simplified persistence table first
                const { data, error } = await supabase
                    .from("startup_evaluations")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;

                // Transform data to match UI needs
                const formattedReports = (data || []).map(item => {
                    // Try to extract name from the report_json if possible, or use ID
                    let title = item.startup_id;
                    let description = "Startup Evaluation";

                    if (item.report_json) {
                        try {
                            const json = typeof item.report_json === 'string'
                                ? JSON.parse(item.report_json)
                                : item.report_json;
                            if (json.startup_name) title = json.startup_name;
                            if (json.summary) {
                                if (typeof json.summary === 'string') {
                                    description = json.summary;
                                } else if (typeof json.summary === 'object') {
                                    // Handle the structured summary from backend
                                    if (json.summary.agents_failed > 0) {
                                        description = `Evaluation complete with ${json.summary.agents_failed} agent errors. Score: ${json.summary.final_score}`;
                                    } else {
                                        description = `Evaluation complete. Score: ${json.summary.final_score}`;
                                    }
                                }
                            }
                        } catch (e) {
                            // ignore parse error
                        }
                    }

                    return {
                        id: item.startup_id, // This fits the route /reports/[id] which expects startup_id
                        title: title,
                        description: description,
                        score: item.final_score,
                        risk_label: item.risk_label,
                        created_at: item.created_at,
                        type: "startup"
                    };
                });

                setReports(formattedReports);
            } catch (err) {
                console.error("Error loading reports:", err);
                setError("Failed to load reports. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        fetchReports();
    }, []);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage your generated reports
                    </p>
                </div>
                <Button className="glow-sm" asChild>
                    <Link href="/evaluate">
                        <FileText className="h-4 w-4 mr-2" />
                        New Evaluation
                    </Link>
                </Button>
            </motion.div>

            {/* Reports List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p>Loading reports...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-red-500 bg-red-500/5 rounded-xl border border-red-500/10">
                        <AlertCircle className="h-8 w-8 mb-2" />
                        <p>{error}</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No reports found. Submit your first evaluation!</p>
                        <Button variant="outline" className="mt-4" asChild>
                            <Link href="/evaluate">Start Evaluation</Link>
                        </Button>
                    </div>
                ) : (
                    reports.map((report, index) => (
                        <ReportCard key={report.id + index} report={report} index={index} />
                    ))
                )}
            </div>
        </div>
    );
}
