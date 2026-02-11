"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCard, AuthHeader } from "@/components/auth/auth-card";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState("loading"); // loading, success, error
    const [error, setError] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            const supabase = createClient();

            // Check if we have an access_token (from email confirmation link)
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (error) {
                setStatus("error");
                setError(error.message);
                return;
            }

            if (session) {
                // Email verified successfully
                setStatus("success");
            } else {
                // No session, show waiting state
                setStatus("waiting");
            }
        };

        // Small delay to show loading state
        const timer = setTimeout(verifyEmail, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleContinue = () => {
        router.push("/");
        router.refresh();
    };

    return (
        <div className="flex justify-center">
            <AuthCard>
                {status === "loading" && (
                    <div className="text-center py-8">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Verifying your email...</p>
                    </div>
                )}

                {status === "success" && (
                    <>
                        <AuthHeader
                            title="Email verified!"
                            description="Your account is now active"
                        />
                        <div className="text-center space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center"
                            >
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </motion.div>
                            <p className="text-sm text-muted-foreground">
                                Thank you for verifying your email. You can now access all features of IdeaEval.
                            </p>
                            <Button
                                onClick={handleContinue}
                                className="w-full h-12 text-base font-medium glow-sm"
                            >
                                Continue to Dashboard
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </>
                )}

                {status === "waiting" && (
                    <>
                        <AuthHeader
                            title="Verify your email"
                            description="Check your inbox for the verification link"
                        />
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                                <Mail className="h-10 w-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    We sent a verification link to your email address. Click the link to verify your account.
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Didn&apos;t receive the email? Check your spam folder or try signing up again.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <Link href="/login">
                                    <Button variant="outline" className="w-full">
                                        Go to sign in
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <AuthHeader
                            title="Verification failed"
                            description="We couldn't verify your email"
                        />
                        <div className="text-center space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center"
                            >
                                <XCircle className="h-10 w-10 text-destructive" />
                            </motion.div>
                            <p className="text-sm text-muted-foreground">
                                {error || "The verification link may have expired or is invalid."}
                            </p>
                            <div className="space-y-3">
                                <Link href="/signup">
                                    <Button className="w-full">Try signing up again</Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="outline" className="w-full">
                                        Go to sign in
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </AuthCard>
        </div>
    );
}
