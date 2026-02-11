"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function EvidenceUpload({
    label = "Upload File",
    description = "Drag & drop files here, or click to select",
    allowedTypes = { "application/pdf": [".pdf"], "image/*": [".png", ".jpg", ".jpeg"] },
    maxSize = 10485760, // 10MB
    onUploadComplete
}) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            setError("Invalid file type or size (Max 10MB)");
            return;
        }
        setError(null);
        setFiles((prev) => [...prev, ...acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file),
            progress: 0 // Mock progress
        }))]);

        // Simulate upload for now
        handleSimulatedUpload(acceptedFiles);
    }, []);

    const handleSimulatedUpload = async (newFiles) => {
        setUploading(true);
        // Mock progress update
        const interval = setInterval(() => {
            setFiles(currentFiles =>
                currentFiles.map(f => {
                    if (newFiles.find(nf => nf.name === f.name) && f.progress < 100) {
                        return { ...f, progress: Math.min(f.progress + 10, 100) };
                    }
                    return f;
                })
            );
        }, 200);

        // Finish after 2 seconds
        setTimeout(() => {
            clearInterval(interval);
            setUploading(false);
            setFiles(currentFiles => currentFiles.map(f => ({ ...f, progress: 100, status: 'completed' })));
            if (onUploadComplete) onUploadComplete(newFiles);
        }, 2000);
    };

    const removeFile = (name) => {
        setFiles((files) => files.filter((f) => f.name !== name));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: allowedTypes,
        maxSize,
        multiple: true
    });

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center text-center",
                    isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50 hover:bg-muted/50",
                    error && "border-destructive/50 bg-destructive/5"
                )}
            >
                <input {...getInputProps()} />
                <div className="p-4 rounded-full bg-muted mb-4">
                    <CloudUpload className="h-6 w-6 text-primary" />
                </div>
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
                <p className="text-xs text-muted-foreground mt-4">
                    PDF, PNG, JPG up to 10MB
                </p>

                {error && (
                    <div className="flex items-center gap-2 mt-4 text-sm text-destructive font-medium">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {files.length > 0 && (
                    <div className="space-y-2">
                        {files.map((file) => (
                            <motion.div
                                key={file.name}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Card className="glass-card p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                            <File className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <button onClick={(e) => { e.stopPropagation(); removeFile(file.name); }} className="text-muted-foreground hover:text-destructive">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                <motion.div
                                                    className={cn("h-full", file.status === 'completed' ? "bg-green-500" : "bg-primary")}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${file.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                        {file.status === 'completed' && (
                                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                        )}
                                        {!file.status && (
                                            <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
