"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Mail, Monitor, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthCard, AuthHeader, AuthFooter, AuthDivider } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialButtons } from "@/components/auth/social-buttons";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";
    const { signIn, signInWithMagicLink, signInWithGoogle, loading, sessionInfo } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMagicLink, setShowMagicLink] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const { data, error } = await signIn(email, password);

            if (error) {
                setAttempts((prev) => prev + 1);
                if (error.message.includes("Invalid login credentials")) {
                    setError("Invalid email or password. Please try again.");
                } else if (error.message.includes("Email not confirmed")) {
                    setError("Please verify your email before signing in.");
                } else {
                    setError(error.message);
                }
                return;
            }

            router.push(redirect);
            router.refresh();
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMagicLink = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const { error } = await signInWithMagicLink(email);

            if (error) {
                setError(error.message);
                return;
            }

            setMagicLinkSent(true);
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                setError(error.message);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        }
    };

    if (magicLinkSent) {
        return (
            <div className="flex justify-center">
                <AuthCard>
                    <AuthHeader
                        title="Check your email"
                        description="We sent a magic link to your email address"
                    />
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Click the link in your email to sign in. The link will expire in 1 hour.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setMagicLinkSent(false)}
                        >
                            Use a different method
                        </Button>
                    </div>
                </AuthCard>
            </div>
        );
    }

    return (
        <div className="flex justify-center">
            <AuthCard>
                <AuthHeader
                    title="Welcome back"
                    description="Sign in to your account to continue"
                />

                {/* Error message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3"
                    >
                        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-destructive">{error}</p>
                            {attempts >= 3 && (
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-primary hover:underline mt-1 inline-block"
                                >
                                    Forgot your password?
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Login attempt feedback */}
                {attempts > 0 && attempts < 3 && !error && (
                    <div className="mb-4 text-center">
                        <Badge variant="secondary" className="text-xs">
                            {3 - attempts} attempts remaining
                        </Badge>
                    </div>
                )}

                {showMagicLink ? (
                    <form onSubmit={handleMagicLink} className="space-y-5">
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
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send magic link
                                </>
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => setShowMagicLink(false)}
                        >
                            Use password instead
                        </Button>
                    </form>
                ) : (
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

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-foreground">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <PasswordInput
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="h-12"
                            />
                        </div>

                        {/* Remember me toggle */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={rememberMe}
                                onClick={() => setRememberMe(!rememberMe)}
                                className={cn(
                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                                    rememberMe ? "bg-primary" : "bg-muted"
                                )}
                            >
                                <span
                                    className={cn(
                                        "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg transform ring-0 transition-transform",
                                        rememberMe ? "translate-x-5" : "translate-x-0"
                                    )}
                                />
                            </button>
                            <span className="text-sm text-muted-foreground">
                                Remember me for 30 days
                            </span>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-medium glow-sm"
                            disabled={isSubmitting || loading}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-foreground"
                            onClick={() => setShowMagicLink(true)}
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Sign in with magic link
                        </Button>
                    </form>
                )}

                <AuthDivider />

                <SocialButtons onGoogleClick={handleGoogleSignIn} loading={loading} />

                <AuthFooter>
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-primary hover:underline font-medium">
                        Sign up
                    </Link>
                </AuthFooter>
            </AuthCard>
        </div>
    );
}
