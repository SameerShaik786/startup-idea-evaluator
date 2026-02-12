"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ReportHeader } from "@/components/report/report-header";
import { SegmentNav } from "@/components/report/segment-nav";
import { OverviewView } from "@/components/report/overview-view";
import { ValidationView } from "@/components/report/validation-view";
import { FinancialView } from "@/components/report/financial-view";
import { MarketView } from "@/components/report/market-view";
import { CompetitionView } from "@/components/report/competition-view";
import { RiskView } from "@/components/report/risk-view";
import { LongevityView, InvestorFitView } from "@/components/report/misc-views";
import { motion, AnimatePresence } from "framer-motion";
// import { Loader2 } from "lucide-react";
const Loader2 = (props) => <span {...props}>⏳</span>;

export default function ReportPage({ params }) {
    const { id } = React.use(params);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSegment, setActiveSegment] = useState("overview");

    useEffect(() => {
        async function fetchReport() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("startup_evaluations")
                .select("*")
                .eq("startup_id", id)
                .single();

            console.log("Fetch result:", { data, error });

            if (data) {
                // Parse report_json if it's a string, otherwise use as is
                const parsedReport = typeof data.report_json === "string"
                    ? JSON.parse(data.report_json)
                    : data.report_json;

                // Scale scores if they are in 0-1 range
                const scale = (s) => (s <= 1 && s > 0) ? s * 100 : s;

                const processedReport = {
                    ...parsedReport,
                    final_score: scale(parsedReport.final_score || data.final_score),
                    component_scores: parsedReport.component_scores
                        ? Object.fromEntries(Object.entries(parsedReport.component_scores).map(([k, v]) => [k, scale(v)]))
                        : {}
                };

                // Merge with metadata
                setReport({
                    ...processedReport,
                    metadata: {
                        created_at: data.created_at,
                        startup_id: data.startup_id
                    }
                });
            }
            setLoading(false);
        }
        fetchReport();
    }, [id]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background text-primary">
                <Loader2 className="h-12 w-12 animate-spin" />
            </div>
        );
    }

    if (!report) {
        return <div className="p-8 text-center text-foreground">Report not found.</div>;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <ReportHeader
                data={report}
                activeSegment={activeSegment}
                onComponentClick={setActiveSegment}
            />

            <SegmentNav
                activeSegment={activeSegment}
                onSelect={setActiveSegment}
            />

            <main className="min-h-[calc(100vh-200px)]">
                <div className="max-w-7xl mx-auto p-4 md:p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSegment}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeSegment === "overview" && <OverviewView data={report} />}
                            {activeSegment === "validation" && <ValidationView data={report} />}
                            {activeSegment === "financial" && <FinancialView data={report} />}
                            {activeSegment === "market" && <MarketView data={report} />}
                            {activeSegment === "competition" && <CompetitionView data={report} />}
                            {activeSegment === "risk" && <RiskView data={report} />}
                            {activeSegment === "longevity" && <LongevityView data={report} />}
                            {activeSegment === "investor-fit" && <InvestorFitView data={report} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
