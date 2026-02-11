"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthCard, AuthHeader } from "@/components/auth/auth-card";
import { useAuth } from "@/lib/auth-context";

export default function ForgotPasswordPage() {
    const { resetPassword, loading } = useAuth();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const { error } = await resetPassword(email);

            if (error) {
                setError(error.message);
                return;
            }

            setEmailSent(true);
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (emailSent) {
        return (
            <div className="flex justify-center">
                <AuthCard>
                    <AuthHeader
                        title="Check your email"
                        description="Password reset instructions sent"
                    />
                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center"
                        >
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </motion.div>
                        <div className="space-y-2">
                            <p className="text-foreground font-medium">{email}</p>
                            <p className="text-sm text-muted-foreground">
                                If an account exists with this email, you&apos;ll receive a password reset link shortly.
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
                            <Link href="/login">
                                <Button variant="ghost" className="w-full">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to sign in
                                </Button>
                            </Link>
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
                    title="Reset your password"
                    description="Enter your email and we'll send you a reset link"
                />

                {/* Error message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3"
                    >
                        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
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
                            "Send reset link"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to sign in
                    </Link>
                </div>
            </AuthCard>
        </div>
    );
}
