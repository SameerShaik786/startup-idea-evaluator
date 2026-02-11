"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Rocket,
  PlusCircle,
  FileText,
  Settings,
  LogOut,
  Briefcase,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useCallback } from "react";

// Navigation items based on user role
const founderNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "My Startup", href: "/startups", icon: Rocket },
  { name: "Evaluate", href: "/evaluate", icon: PlusCircle },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

const investorNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Portfolio", href: "/startups", icon: Briefcase },
  { name: "Discover", href: "/discover", icon: Search },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];



// ... keep existing imports ...

export function Sidebar({ onSignOut }) {
  const { user, updateProfile } = useAuth();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Get navigation based on role
  // Default to investor if no role is found
  const userRole = user?.user_metadata?.role || "investor";
  const navigation = userRole === "founder" ? founderNavigation : investorNavigation;

  const handleSwitchRole = async () => {
    setIsSwitching(true);
    const newRole = userRole === "founder" ? "investor" : "founder";
    console.log("Switching role to:", newRole);
    try {
      const { data, error } = await updateProfile({ role: newRole });
      if (error) {
        console.error("Error updating profile:", error);
      } else {
        console.log("Profile updated successfully:", data);
        // Optional: Force a router refresh if needed, but context should handle it
        // router.refresh(); 
      }
    } catch (error) {
      console.error("Failed to switch role:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  // Debounced hover handlers for smooth expansion
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

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

  const isExpanded = isHovered;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 240 : 72 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen",
        "bg-sidebar border-r border-sidebar-border",
        "flex flex-col"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shrink-0">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </div>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15, delay: 0.05 }}
              className="text-lg font-medium text-foreground whitespace-nowrap tracking-tight"
            >
              IdeaEval
            </motion.span>
          )}
        </Link>
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          const navItem = (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5",
                "text-sm font-normal transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-sidebar-primary"
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
              )}

              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-sidebar-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />

              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15, delay: index * 0.02 }}
                  className="whitespace-nowrap"
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          );

          if (!isExpanded) {
            return (
              <Tooltip key={item.name} delayDuration={0}>
                <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                <TooltipContent side="right" className="font-normal">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          }

          return navItem;
        })}
      </nav>

      <Separator className="opacity-50" />

      {/* User Section */}
      <div className="p-3 space-y-1">
        <div className={cn("flex", isExpanded ? "justify-end mb-2" : "justify-center mb-2")}>
          <ThemeToggle />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 w-full",
                "bg-sidebar-accent/30 transition-colors hover:bg-sidebar-accent/50 outline-none"
              )}
            >
              <Avatar className="h-8 w-8 border border-border shrink-0">
                <AvatarImage src={user?.avatar || "/avatar.png"} alt={user?.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name || "Guest User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate capitalize">
                    {user?.user_metadata?.role || "Investor"}
                  </p>
                </motion.div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56" sideOffset={8}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                handleSwitchRole();
              }}
              className="cursor-pointer"
              disabled={isSwitching}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              <span>
                {isSwitching ? "Switching..." : `Switch to ${userRole === "founder" ? "Investor" : "Founder"}`}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
}
