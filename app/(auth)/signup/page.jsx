"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2, Mail, Briefcase, Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthCard, AuthHeader, AuthFooter, AuthDivider } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialButtons } from "@/components/auth/social-buttons";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export default function SignupPage() {
    const router = useRouter();
    const { signUp, signInWithGoogle, loading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("investor");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    // Inline validation
    const [touched, setTouched] = useState({
        email: false,
        password: false,
        confirmPassword: false,
    });

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const passwordsMatch = password === confirmPassword;
    const isPasswordStrong = password.length >= 8;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validate
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!isPasswordStrong) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error } = await signUp(email, password, { role });

            if (error) {
                if (error.message.includes("already registered")) {
                    setError("This email is already registered. Please sign in instead.");
                } else {
                    setError(error.message);
                }
                return;
            }

            setSignupSuccess(true);
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

    if (signupSuccess) {
        return (
            <div className="flex justify-center">
                <AuthCard>
                    <AuthHeader
                        title="Check your email"
                        description="We sent a verification link to your email"
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
                                Click the link in your email to verify your account and get started.
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
                    title="Create your account"
                    description="Start evaluating startups with AI-powered insights"
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
                            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                            placeholder="you@example.com"
                            required
                            className={cn(
                                "h-12",
                                touched.email && !validateEmail(email) && email && "border-destructive"
                            )}
                            autoFocus
                        />
                        {touched.email && !validateEmail(email) && email && (
                            <p className="text-xs text-destructive">Please enter a valid email</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Password
                        </label>
                        <PasswordInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                            placeholder="Create a strong password"
                            showStrength={true}
                            required
                            className="h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Confirm password
                        </label>
                        <PasswordInput
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                            placeholder="Confirm your password"
                            required
                            className={cn(
                                "h-12",
                                touched.confirmPassword && confirmPassword && !passwordsMatch && "border-destructive"
                            )}
                        />
                        {touched.confirmPassword && confirmPassword && !passwordsMatch && (
                            <p className="text-xs text-destructive">Passwords do not match</p>
                        )}
                        {touched.confirmPassword && confirmPassword && passwordsMatch && (
                            <p className="text-xs text-green-500 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Passwords match
                            </p>
                        )}
                    </div>

                    {/* Role selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">
                            I am a...
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole("investor")}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 outline-none",
                                    role === "investor"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border hover:border-border/80 hover:bg-muted/50 text-muted-foreground"
                                )}
                            >
                                <Briefcase className={cn("h-6 w-6", role === "investor" ? "text-primary" : "text-muted-foreground")} />
                                <span className="text-sm font-medium">Investor</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("founder")}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 outline-none",
                                    role === "founder"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border hover:border-border/80 hover:bg-muted/50 text-muted-foreground"
                                )}
                            >
                                <Rocket className={cn("h-6 w-6", role === "founder" ? "text-primary" : "text-muted-foreground")} />
                                <span className="text-sm font-medium">Founder</span>
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium glow-sm"
                        disabled={isSubmitting || loading}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            "Create account"
                        )}
                    </Button>
                </form>

                <AuthDivider />

                <SocialButtons onGoogleClick={handleGoogleSignIn} loading={loading} />

                <AuthFooter>
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Sign in
                    </Link>
                </AuthFooter>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="underline hover:text-foreground">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline hover:text-foreground">
                        Privacy Policy
                    </Link>
                </p>
            </AuthCard>
        </div>
    );
}
