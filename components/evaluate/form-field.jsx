"use client";

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export function FormField({
    label,
    description,
    required = false,
    error,
    children,
    className,
    characterCount,
    maxCharacters,
}) {
    return (
        <div className={cn("space-y-2", className)}>
            {/* Label Row */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>

                {/* Character Count */}
                {characterCount !== undefined && maxCharacters && (
                    <span
                        className={cn(
                            "text-xs",
                            characterCount > maxCharacters
                                ? "text-destructive"
                                : "text-muted-foreground"
                        )}
                    >
                        {characterCount}/{maxCharacters}
                    </span>
                )}
            </div>

            {/* Description */}
            {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}

            {/* Field Content */}
            {children}

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-1.5 text-destructive text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </div>
            )}
        </div>
    );
}
