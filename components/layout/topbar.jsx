"use client";

import { Bell, Search, Command, ChevronDown, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Evaluation status configurations
const statusConfig = {
    idle: {
        label: "Ready",
        icon: CheckCircle2,
        className: "bg-muted text-muted-foreground",
    },
    evaluating: {
        label: "Evaluating",
        icon: Loader2,
        className: "bg-primary/15 text-primary",
        iconClass: "animate-spin",
    },
    completed: {
        label: "Completed",
        icon: CheckCircle2,
        className: "bg-green-500/15 text-green-500",
    },
    error: {
        label: "Error",
        icon: AlertCircle,
        className: "bg-destructive/15 text-destructive",
    },
};

export function Topbar({
    user,
    startups = [],
    selectedStartup,
    onStartupChange,
    evaluationStatus = "idle",
    notifications = [],
}) {
    // Get user initials
    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const userRole = user?.role || "investor";
    const isInvestor = userRole === "investor";
    const status = statusConfig[evaluationStatus] || statusConfig.idle;
    const StatusIcon = status.icon;
    const unreadCount = notifications.filter((n) => !n.read).length || 3;

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-6">
            {/* Left Section - Startup Selector (Investors only) */}
            <div className="flex items-center gap-4">
                {isInvestor && startups.length > 0 ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 h-9 px-3 bg-transparent border-border hover:bg-muted/50"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                                        <span className="text-xs font-medium text-foreground">
                                            {selectedStartup?.name?.[0] || "S"}
                                        </span>
                                    </div>
                                    <span className="text-sm font-normal max-w-[120px] truncate">
                                        {selectedStartup?.name || "Select Startup"}
                                    </span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64">
                            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal uppercase tracking-wide">
                                Portfolio Startups
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {startups.map((startup) => (
                                <DropdownMenuItem
                                    key={startup.id}
                                    onClick={() => onStartupChange?.(startup)}
                                    className={cn(
                                        "flex items-center gap-3 py-2.5 cursor-pointer",
                                        selectedStartup?.id === startup.id && "bg-accent"
                                    )}
                                >
                                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                        <span className="text-sm font-medium text-foreground">
                                            {startup.name?.[0]}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-normal truncate">{startup.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {startup.industry || "Startup"}
                                        </p>
                                    </div>
                                    {startup.score && (
                                        <Badge variant="secondary" className="text-xs font-normal">
                                            {startup.score}
                                        </Badge>
                                    )}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-primary text-sm justify-center font-normal">
                                + Add Startup
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="text-sm text-muted-foreground">
                        {isInvestor ? "No startups in portfolio" : ""}
                    </div>
                )}

                {/* Evaluation Status - Founders only */}
                {!isInvestor && (
                    <div
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-normal",
                            status.className
                        )}
                    >
                        <StatusIcon className={cn("h-3.5 w-3.5", status.iconClass)} />
                        <span>{status.label}</span>
                    </div>
                )}
            </div>

            {/* Center - Search */}
            <button
                className="flex items-center gap-3 rounded-lg border border-border bg-transparent px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/30 w-80"
                onClick={() => {/* Command palette */ }}
            >
                <Search className="h-4 w-4" />
                <span>Search...</span>
                <div className="ml-auto flex items-center gap-1">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-normal text-muted-foreground">
                        <Command className="h-3 w-3" />K
                    </kbd>
                </div>
            </button>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center"
                                >
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="font-normal">
                            Notifications
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                            <span className="text-sm font-normal">Evaluation Complete</span>
                            <span className="text-xs text-muted-foreground">
                                TechFlow AI scored 87/100 · 2 min ago
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                            <span className="text-sm font-normal">New Report Generated</span>
                            <span className="text-xs text-muted-foreground">
                                Q4 Portfolio Analysis ready · 1 hour ago
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                            <span className="text-sm font-normal">Market Update</span>
                            <span className="text-xs text-muted-foreground">
                                AI/ML sector trends updated · 3 hours ago
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center text-primary text-sm">
                            View all notifications
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Separator */}
                <div className="h-6 w-px bg-border" />

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 px-2 hover:bg-muted/50"
                        >
                            <Avatar className="h-8 w-8 border border-border">
                                <AvatarImage src={user?.avatar || "/avatar.png"} alt={user?.name || "User"} />
                                <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                                    {getInitials(user?.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-normal leading-none">
                                    {user?.name || "Guest User"}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {user?.role || "Investor"}
                                </p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-normal leading-none">
                                    {user?.name || "Guest User"}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email || "Not signed in"}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuItem>API Keys</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
