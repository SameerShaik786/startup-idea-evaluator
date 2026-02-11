"use client";

import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function AuthCard({ children, className }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md"
        >
            <Card
                className={cn(
                    "glass-card border-border/50",
                    "shadow-2xl shadow-primary/5",
                    className
                )}
            >
                <CardContent className="p-8">{children}</CardContent>
            </Card>
        </motion.div>
    );
}

export function AuthHeader({ title, description }) {
    return (
        <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                    <Rocket className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold text-foreground">IdeaEval</span>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
            </h1>
            {description && (
                <p className="text-muted-foreground mt-2 text-sm">{description}</p>
            )}
        </div>
    );
}

export function AuthFooter({ children }) {
    return (
        <div className="mt-6 text-center text-sm text-muted-foreground">
            {children}
        </div>
    );
}

export function AuthDivider({ text = "or continue with" }) {
    return (
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{text}</span>
            </div>
        </div>
    );
}
