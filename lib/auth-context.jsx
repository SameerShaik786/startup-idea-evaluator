"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionInfo, setSessionInfo] = useState(null);
    const supabase = createClient();

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Error getting session:", error);
                    return;
                }

                setSession(session);
                setUser(session?.user ?? null);

                // Get session metadata if user exists
                if (session?.user) {
                    extractSessionInfo(session);
                }
            } catch (error) {
                console.error("Session error:", error);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    extractSessionInfo(session);

                    // Ensure profile exists on sign-in
                    if (event === "SIGNED_IN") {
                        await ensureProfile(supabase, session.user);
                    }
                } else {
                    setSessionInfo(null);
                }

                // Handle token refresh
                if (event === "TOKEN_REFRESHED") {
                    console.log("Token refreshed successfully");
                }

                // Handle sign out
                if (event === "SIGNED_OUT") {
                    setSessionInfo(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    const extractSessionInfo = (session) => {
        if (!session) return;

        // Extract device/session info from user agent
        const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";
        const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
        const browser = getBrowserName(userAgent);
        const os = getOSName(userAgent);

        setSessionInfo({
            device: isMobile ? "Mobile" : "Desktop",
            browser,
            os,
            lastSignIn: session.user?.last_sign_in_at,
            expiresAt: session.expires_at,
            persistedSession: !!session.refresh_token,
        });
    };

    const signUp = async (email, password, metadata = {}) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const signInWithMagicLink = async (email) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async (newPassword) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data) => {
        setLoading(true);
        try {
            const { data: userData, error } = await supabase.auth.updateUser({
                data: data,
            });

            if (error) throw error;
            return { data: userData, error: null };
        } catch (error) {
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        session,
        loading,
        sessionInfo,
        signUp,
        signIn,
        signInWithMagicLink,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Ensure a profile row exists for the given user
async function ensureProfile(supabase, user) {
    try {
        const { data: existing } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single();

        if (!existing) {
            const role = user.user_metadata?.role || "INVESTOR";
            await supabase.from("profiles").insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                avatar_url: user.user_metadata?.avatar_url || null,
                role: role.toUpperCase(),
            });
        }
    } catch (err) {
        console.error("Error ensuring profile:", err);
    }
}

// Helper functions
function getBrowserName(userAgent) {
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("SamsungBrowser")) return "Samsung Browser";
    if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    return "Unknown";
}

function getOSName(userAgent) {
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iOS") || userAgent.includes("iPhone")) return "iOS";
    return "Unknown";
}
