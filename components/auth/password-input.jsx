"use client";

import { useState, useMemo } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PasswordInput({
    value,
    onChange,
    placeholder = "Password",
    showStrength = false,
    className,
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);

    const strength = useMemo(() => {
        if (!value || !showStrength) return null;
        return calculatePasswordStrength(value);
    }, [value, showStrength]);

    return (
        <div className="space-y-2">
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={cn("pr-10", className)}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                    </span>
                </Button>
            </div>

            {showStrength && value && strength && (
                <div className="space-y-2">
                    {/* Strength bar */}
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                            <div
                                key={level}
                                className={cn(
                                    "h-1 flex-1 rounded-full transition-all duration-300",
                                    level <= strength.level
                                        ? strength.level === 1
                                            ? "bg-red-500"
                                            : strength.level === 2
                                                ? "bg-orange-500"
                                                : strength.level === 3
                                                    ? "bg-yellow-500"
                                                    : "bg-green-500"
                                        : "bg-muted"
                                )}
                            />
                        ))}
                    </div>

                    {/* Strength label */}
                    <div className="flex items-center justify-between">
                        <span
                            className={cn(
                                "text-xs font-medium",
                                strength.level === 1 && "text-red-500",
                                strength.level === 2 && "text-orange-500",
                                strength.level === 3 && "text-yellow-500",
                                strength.level === 4 && "text-green-500"
                            )}
                        >
                            {strength.label}
                        </span>
                    </div>

                    {/* Requirements checklist */}
                    <div className="space-y-1.5 mt-3">
                        {strength.requirements.map((req, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-center gap-2 text-xs transition-colors",
                                    req.met ? "text-green-500" : "text-muted-foreground"
                                )}
                            >
                                {req.met ? (
                                    <Check className="h-3.5 w-3.5" />
                                ) : (
                                    <X className="h-3.5 w-3.5" />
                                )}
                                <span>{req.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function calculatePasswordStrength(password) {
    const requirements = [
        {
            label: "At least 8 characters",
            met: password.length >= 8,
        },
        {
            label: "Contains uppercase letter",
            met: /[A-Z]/.test(password),
        },
        {
            label: "Contains lowercase letter",
            met: /[a-z]/.test(password),
        },
        {
            label: "Contains number",
            met: /\d/.test(password),
        },
        {
            label: "Contains special character",
            met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        },
    ];

    const metCount = requirements.filter((r) => r.met).length;

    let level, label;
    if (metCount <= 1) {
        level = 1;
        label = "Weak";
    } else if (metCount <= 2) {
        level = 2;
        label = "Fair";
    } else if (metCount <= 4) {
        level = 3;
        label = "Good";
    } else {
        level = 4;
        label = "Strong";
    }

    return { level, label, requirements };
}
