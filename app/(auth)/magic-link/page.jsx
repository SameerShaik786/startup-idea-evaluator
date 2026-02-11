"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthCard, AuthHeader, AuthFooter } from "@/components/auth/auth-card";
import { useAuth } from "@/lib/auth-context";

export default function MagicLinkPage() {
    const { signInWithMagicLink, loading } = useAuth();

    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [linkSent, setLinkSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const { error } = await signInWithMagicLink(email);

            if (error) {
                setError(error.message);
                return;
            }

            setLinkSent(true);
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (linkSent) {
        return (
            <div className="flex justify-center">
                <AuthCard>
                    <AuthHeader
                        title="Check your email"
                        description="We sent a magic link to your email"
                    />
                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center relative"
                        >
                            <Mail className="h-8 w-8 text-primary" />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -top-1 -right-1"
                            >
                                <Sparkles className="h-5 w-5 text-primary" />
                            </motion.div>
                        </motion.div>
                        <div className="space-y-2">
                            <p className="text-foreground font-medium">{email}</p>
                            <p className="text-sm text-muted-foreground">
                                Click the magic link in your email to sign in instantly. No password needed!
                            </p>
                        </div>
                        <div className="pt-4 space-y-3">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => window.location.href = "mailto:"}
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                Open email app
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => setLinkSent(false)}
                            >
                                Try a different email
                            </Button>
                        </div>
                    </div>
                </AuthCard>
            </div>
        );
    }

    return (
        <div className="flex justify-center">
            <AuthCard>
                <AuthHeader
                    title="Magic link sign in"
                    description="Sign in with just your email — no password required"
                />

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                    >
                        <p className="text-sm text-destructive">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Email address
                        </label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="h-12"
                            autoFocus
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium glow-sm"
                        disabled={isSubmitting || loading}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending link...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Send magic link
                            </>
                        )}
                    </Button>
                </form>

                <AuthFooter>
                    Want to use a password?{" "}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Sign in with password
                    </Link>
                </AuthFooter>
            </AuthCard>
        </div>
    );
}
