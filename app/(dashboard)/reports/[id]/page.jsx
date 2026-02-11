"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
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
import { Loader2 } from "lucide-react";

export default function ReportPage({ params }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSegment, setActiveSegment] = useState("overview");

    useEffect(() => {
        async function fetchReport() {
            const { data, error } = await supabase
                .from("startup_evaluations")
                .select("*")
                .eq("startup_id", params.id)
                .single();

            if (data) {
                // Parse report_json if it's a string, otherwise use as is
                const parsedReport = typeof data.report_json === "string"
                    ? JSON.parse(data.report_json)
                    : data.report_json;

                // Merge with metadata
                setReport({
                    ...parsedReport,
                    metadata: {
                        created_at: data.created_at,
                        startup_id: data.startup_id
                    }
                });
            }
            setLoading(false);
        }
        fetchReport();
    }, [params.id]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#202020] text-blue-500">
                <Loader2 className="h-12 w-12 animate-spin" />
            </div>
        );
    }

    if (!report) {
        return <div className="p-8 text-center text-white">Report not found.</div>;
    }

    return (
        <div className="min-h-screen bg-[#202020] pb-20">
            <ReportHeader
                data={report}
                activeSegment={activeSegment}
                onComponentClick={setActiveSegment}
            />

            <SegmentNav
                activeSegment={activeSegment}
                onSelect={setActiveSegment}
            />

            <main className={`transition-colors duration-500 min-h-[calc(100vh-200px)] ${activeSegment !== 'overview' ? 'bg-slate-900/50' : ''
                }`}>
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
