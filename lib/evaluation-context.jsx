"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const EvaluationStatusContext = createContext(undefined);

export function EvaluationStatusProvider({ children }) {
    const [currentStatus, setCurrentStatus] = useState("draft"); // draft, submitted, processing, consensus, completed
    const [activeId, setActiveId] = useState(null);
    const [confidenceScore, setConfidenceScore] = useState(0);
    const [loading, setLoading] = useState(true);

    // Simulated polling/update logic for now
    // Real implementation would use Supabase Realtime
    useEffect(() => {
        // Just a mock effect to simulate loading state
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const updateStatus = (status) => {
        setCurrentStatus(status);
        // In real app, would verify with backend
    };

    const value = {
        currentStatus,
        activeId,
        confidenceScore,
        loading,
        updateStatus,
    };

    return (
        <EvaluationStatusContext.Provider value={value}>
            {children}
        </EvaluationStatusContext.Provider>
    );
}

export function useEvaluationStatus() {
    const context = useContext(EvaluationStatusContext);
    if (context === undefined) {
        throw new Error("useEvaluationStatus must be used within an EvaluationStatusProvider");
    }
    return context;
}
