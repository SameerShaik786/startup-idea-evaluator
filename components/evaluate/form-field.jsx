"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, FileText, Lightbulb } from "lucide-react";

// Field types for Evidence vs Opinion labeling
const FIELD_TYPES = {
    EVIDENCE: "evidence",
    OPINION: "opinion",
    BOTH: "both",
};

export function FormField({
    label,
    description,
    required = false,
    fieldType = FIELD_TYPES.BOTH,
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
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-foreground">
                        {label}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </label>

                    {/* Evidence vs Opinion Badge */}
                    {fieldType === FIELD_TYPES.EVIDENCE && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <FileText className="h-3 w-3" />
                            Evidence
                        </span>
                    )}
                    {fieldType === FIELD_TYPES.OPINION && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <Lightbulb className="h-3 w-3" />
                            Opinion
                        </span>
                    )}
                </div>

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

// Export field types for use in form
FormField.TYPES = FIELD_TYPES;
