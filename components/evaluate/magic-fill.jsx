"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, Link as LinkIcon, FileText } from "lucide-react";
import { toast } from "sonner";

export function MagicFill({ onFill }) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const res = await fetch("/api/py/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server returned ${res.status}: ${errorText}`);
            }

            const data = await res.json();
            onFill(data);
            setOpen(false);
            toast.success("Form auto-filled from your pitch!");
        } catch (error) {
            console.error("Magic Fill Error:", error);
            toast.error(`Failed to analyze: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 hover:text-indigo-300"
                >
                    <Wand2 className="h-4 w-4" />
                    Magic Auto-Fill
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-background/95 backdrop-blur-xl border-white/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Wand2 className="h-5 w-5 text-indigo-400" />
                        Magic Auto-Fill
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-200">
                        <p>Paste your <strong>Pitch Deck text</strong>, <strong>Executive Summary</strong>, or <strong>Website URL</strong> content here.</p>
                        <p className="opacity-70 mt-1 text-xs">Our AI will extract the details and fill the form for you.</p>
                    </div>

                    <Textarea
                        placeholder="Paste text here..."
                        className="min-h-[200px] font-mono text-sm bg-black/20 border-white/10 resize-none focus-visible:ring-indigo-500/50"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <div className="flex justify-between gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setText(`Airbnb is a platform where users can rent out their space to travelers to save money. We provide a way to book rooms with locals, offering a more authentic experience than hotels.
Target Market: Budget travelers and people looking for unique experiences.
Market Size: 1.9 Billion trips booked worldwide. 532 Million budget trips. We are targeting a 10.6 Million trips serviceable market.
Business Model: We take a 10% commission on each transaction.
Competitive Advantage: First to market, ease of use, host incentive, design-focused.
Competition: CouchSurfing (no money exchange), Craigslist (unsafe), Hotels (expensive, impersonal).
Product: A simple 3-step process: Search by City, Review Listings, Book it.
Financials: We project 80k trips in 2011 with $2M revenue.
Team: We have a strong design and engineering background.`)}
                            className="mr-auto text-xs text-muted-foreground hover:text-foreground"
                        >
                            <FileText className="h-3 w-3 mr-1" />
                            Load Demo Data (Airbnb)
                        </Button>

                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleAnalyze}
                                disabled={loading || !text.trim()}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="h-4 w-4" />
                                        Auto-Fill Form
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
