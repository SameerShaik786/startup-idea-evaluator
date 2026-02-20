"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function DashboardShell({
    children,
    startups = [],
    selectedStartup,
    onStartupChange,
    evaluationStatus = "idle",
}) {
    const router = useRouter();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <TooltipProvider delayDuration={0}>
            <div className="min-h-screen bg-background">
                {/* Sidebar */}
                <Sidebar user={user} onSignOut={handleSignOut} />

                {/* Main Content Area - adjusts for collapsed sidebar */}
                <div className="pl-[72px] hover:pl-[72px] transition-all duration-200">
                    <Topbar
                        user={user}
                        startups={startups}
                        selectedStartup={selectedStartup}
                        onStartupChange={onStartupChange}
                        evaluationStatus={evaluationStatus}
                    />

                    <main className="min-h-[calc(100vh-4rem)]">
                        <div className="px-6 py-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
