"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const Alert = ({ children, className }) => <div className={`p-4 rounded-lg border ${className}`}>{children}</div>;
const AlertTitle = ({ children }) => <h5 className="font-bold mb-1">{children}</h5>;
const AlertDescription = ({ children }) => <div className="text-sm opacity-90">{children}</div>;
const CheckCircle2 = (props) => <span {...props}>✅</span>;
const AlertTriangle = (props) => <span {...props}>⚠️</span>;
import { CustomBarChart } from "./charts";

export function ValidationView({ data }) {
    const validation = data?.agent_results?.validator;

    if (!validation || validation.error) {
        return <div className="p-8 text-center text-gray-400 border border-dashed border-gray-800 rounded-xl">Validation data not available for this report.</div>;
    }

    const { consistency_score = 0, completeness_score = 0, flags = [], sentiment = "neutral" } = validation;

    const chartData = [
        { name: "Consistency", score: consistency_score },
        { name: "Completeness", score: completeness_score },
        { name: "Sentiment", score: sentiment === "positive" ? 80 : sentiment === "neutral" ? 50 : 20 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-3 gap-4">
                <ScoreCard title="Consistency Score" score={consistency_score} color="text-green-500" />
                <ScoreCard title="Completeness Score" score={completeness_score} color="text-blue-500" />
                <ScoreCard title="Confidence Level" score={(consistency_score + completeness_score) / 2} color="text-primary" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-transparent border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Integrity & Sentiment Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomBarChart data={chartData} xKey="name" yKey="score" color="#10b981" />
                        <div className="mt-4 p-3 rounded bg-muted/20 border border-muted/30">
                            <span className="text-xs text-gray-400 uppercase font-bold">Sentiment Overview:</span>
                            <span className={cn(
                                "ml-2 text-sm font-semibold capitalize",
                                sentiment === 'positive' ? 'text-green-500' : sentiment === 'negative' ? 'text-red-500' : 'text-muted-foreground'
                            )}>
                                {sentiment}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-transparent border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Potential Discrepancies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {flags && flags.length > 0 ? (
                            <div className="space-y-3">
                                {flags.map((flag, i) => (
                                    <Alert key={i} className="bg-yellow-950/10 border-yellow-900/30">
                                        <div className="flex gap-3">
                                            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-1" />
                                            <div>
                                                <AlertTitle className="text-yellow-500 text-sm">Discrepancy Found</AlertTitle>
                                                <AlertDescription className="text-muted-foreground leading-relaxed">
                                                    {flag}
                                                </AlertDescription>
                                            </div>
                                        </div>
                                    </Alert>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-green-500 space-y-2 py-12 bg-green-950/5 rounded-lg border border-green-950/10">
                                <CheckCircle2 className="h-10 w-10 opacity-80" />
                                <p className="font-medium">Data integrity verified. No major flags.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Simple Helper for Badge/Color logic if cn is not imported (though it usually is in this project)
const cn = (...classes) => classes.filter(Boolean).join(' ');

function ScoreCard({ title, score, color }) {
    return (
        <Card className="bg-transparent border-border overflow-hidden relative">
            <div className={cn("absolute top-0 left-0 w-1 h-full bg-current opacity-50", color.replace('text-', 'bg-'))} />
            <CardContent className="pt-6">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</div>
                <div className={cn("text-3xl font-bold mt-1", color)}>{Math.round(score)}/100</div>
            </CardContent>
        </Card>
    );
}
