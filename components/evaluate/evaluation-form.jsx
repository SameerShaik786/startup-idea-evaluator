"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft, ChevronRight, Save, Send, Clock,
    DollarSign, TrendingUp, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepProgress } from "./step-progress";
import { FormField } from "./form-field";
import { ConfidenceIndicator } from "./confidence-indicator";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────

const INDUSTRIES = [
    "AI / Machine Learning",
    "B2B SaaS",
    "Consumer Tech",
    "E-commerce",
    "EdTech",
    "FinTech",
    "HealthTech",
    "Climate / CleanTech",
    "Marketplace",
    "Hardware / IoT",
    "Other",
];

const STAGES = [
    "Pre-seed",
    "Seed",
    "Series A",
    "Series B",
    "Series C+",
    "Pre-revenue",
    "Revenue Generating",
];

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"];

import { MagicFill } from "./magic-fill"; // Import MagicFill component

// ─── Form State ───────────────────────────────────────────

const initialFormData = {
    // Step 1: Startup Identity → maps to StartupContext
    startupName: "",
    tagline: "",
    website: "",
    industry: "",
    stage: "",
    foundedDate: "",

    // Step 2: Problem & Customer → qualitative for agents
    problemDescription: "",
    targetCustomerPersona: "",
    currentAlternatives: "",
    whyNow: "",

    // Step 3: Financials → maps to FinancialRawInput
    periodStart: "",
    periodEnd: "",
    revenue: "",
    cogs: "",
    operatingExpenses: "",
    cashBalance: "",
    monthlyBurnRate: "",
    currency: "USD",

    // Step 4: Product & Traction
    productDescription: "",
    demoUrl: "",
    usersCount: "",
    retentionMetrics: "",

    // Step 5: Market & Competition
    competitors: "",
    differentiation: "",
    whyYouWin: "",

    // Step 6: Team
    founderBackground: "",
    domainExperience: "",
    pastWinsFailures: "",
};

// ─── Validation ───────────────────────────────────────────

const validationRules = {
    // Step 1
    startupName: { required: true, minLength: 2 },
    tagline: { required: true, minLength: 10 },
    website: { required: false, pattern: /^(https?:\/\/)?[\w.-]+\.\w{2,}(\/.*)?$/ },
    industry: { required: true },
    stage: { required: true },
    foundedDate: { required: false },

    // Step 2
    problemDescription: { required: true, minLength: 100 },
    targetCustomerPersona: { required: true, minLength: 50 },
    currentAlternatives: { required: true, minLength: 30 },
    whyNow: { required: true, minLength: 50 },

    // Step 3 — Financials (all required for backend engine)
    periodStart: { required: true },
    periodEnd: { required: true },
    revenue: { required: true, isNumber: true },
    cogs: { required: true, isNumber: true },
    operatingExpenses: { required: true, isNumber: true },
    cashBalance: { required: true, isNumber: true },
    monthlyBurnRate: { required: true, isNumber: true },
    currency: { required: true },

    // Step 4
    productDescription: { required: true, minLength: 50 },
    demoUrl: { required: false },
    usersCount: { required: false },
    retentionMetrics: { required: false },

    // Step 5
    competitors: { required: true, minLength: 30 },
    differentiation: { required: true, minLength: 50 },
    whyYouWin: { required: true, minLength: 50 },

    // Step 6
    founderBackground: { required: true, minLength: 50 },
    domainExperience: { required: true, minLength: 30 },
    pastWinsFailures: { required: false },
};

const stepFields = {
    1: ["startupName", "tagline", "website", "industry", "stage", "foundedDate"],
    2: ["problemDescription", "targetCustomerPersona", "currentAlternatives", "whyNow"],
    3: ["periodStart", "periodEnd", "revenue", "cogs", "operatingExpenses", "cashBalance", "monthlyBurnRate", "currency"],
    4: ["productDescription", "demoUrl", "usersCount", "retentionMetrics"],
    5: ["competitors", "differentiation", "whyYouWin"],
    6: ["founderBackground", "domainExperience", "pastWinsFailures"],
};

const TOTAL_STEPS = 6;

const STEP_TITLES = {
    1: "Startup Identity",
    2: "Problem & Customer",
    3: "Financials",
    4: "Product & Traction",
    5: "Market & Competition",
    6: "Team",
};

// ─── Reusable Sub-Components (defined OUTSIDE to prevent focus loss) ──

function FormTextarea({ name, value, onChange, placeholder, rows = 4, className }) {
    return (
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={cn(
                "flex w-full rounded-lg border border-input px-4 py-3 text-sm",
                "ring-offset-background placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "resize-none",
                className
            )}
        />
    );
}

function FormSelect({ name, value, onChange, options, placeholder }) {
    return (
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={cn(
                "flex h-11 w-full rounded-lg border border-input px-4 py-2 text-sm",
                "ring-offset-background focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2",
                !value && "text-muted-foreground"
            )}
        >
            <option value="" disabled>{placeholder}</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    );
}

function FormCurrencyInput({ name, label, description, error, placeholder, icon: Icon, value, onChange }) {
    return (
        <FormField
            label={label}
            description={description}
            required
            error={error}
        >
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Icon className="h-4 w-4" />
                    </div>
                )}
                <Input
                    name={name}
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={cn("h-11", Icon && "pl-9")}
                />
            </div>
        </FormField>
    );
}

// ─── Component ────────────────────────────────────────────

export function EvaluationForm({ onSubmit }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [completedSteps, setCompletedSteps] = useState([]);
    const [lastSaved, setLastSaved] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Load draft
    useEffect(() => {
        const savedDraft = localStorage.getItem("evaluation-draft");
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                setFormData(parsed.formData || initialFormData);
                setCompletedSteps(parsed.completedSteps || []);
                setCurrentStep(parsed.currentStep || 1);
                setLastSaved(parsed.savedAt ? new Date(parsed.savedAt) : null);
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
    }, []);

    // Auto-save
    useEffect(() => {
        const interval = setInterval(() => { saveDraft(); }, 30000);
        return () => clearInterval(interval);
    }, [formData, currentStep, completedSteps]);

    const saveDraft = useCallback(() => {
        setIsSaving(true);
        const draft = {
            formData,
            currentStep,
            completedSteps,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem("evaluation-draft", JSON.stringify(draft));
        setLastSaved(new Date());
        setTimeout(() => setIsSaving(false), 500);
    }, [formData, currentStep, completedSteps]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const validateField = (name, value) => {
        const rules = validationRules[name];
        if (!rules) return null;
        if (rules.required && (!value || String(value).trim() === "")) {
            return "This field is required";
        }
        if (rules.minLength && value && value.length < rules.minLength) {
            return `Minimum ${rules.minLength} characters required`;
        }
        if (rules.pattern && value && !rules.pattern.test(value)) {
            return "Invalid format";
        }
        if (rules.isNumber && value && isNaN(Number(value))) {
            return "Must be a valid number";
        }
        return null;
    };

    const validateStep = () => {
        const fields = stepFields[currentStep];
        const newErrors = {};
        let isValid = true;
        fields.forEach((field) => {
            const error = validateField(field, formData[field]);
            if (error && validationRules[field].required) {
                newErrors[field] = error;
                isValid = false;
            }
        });
        setErrors(newErrors);
        return isValid;
    };

    const getSectionCompletion = () => {
        return Object.entries(STEP_TITLES).map(([step, name]) => ({
            name,
            totalFields: stepFields[step].filter(f => validationRules[f]?.required).length,
            completedFields: stepFields[step].filter(f => {
                const val = formData[f];
                return validationRules[f]?.required && val && String(val).trim() !== "";
            }).length,
        }));
    };

    const handleNext = () => {
        if (validateStep()) {
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps((prev) => [...prev, currentStep]);
            }
            setCurrentStep((prev) => Math.min(TOTAL_STEPS, prev + 1));
            saveDraft();
        }
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };

    const handleSubmit = () => {
        if (validateStep()) {
            // Build backend-ready JSON
            const outputData = {
                startup_context: {
                    name: formData.startupName,
                    description: formData.tagline,
                    industry: formData.industry,
                    stage: formData.stage,
                    website: formData.website || null,
                    founded_date: formData.foundedDate || null,
                },
                financial_raw_input: {
                    period_start: formData.periodStart,
                    period_end: formData.periodEnd,
                    revenue: parseFloat(formData.revenue) || 0,
                    cogs: parseFloat(formData.cogs) || 0,
                    operating_expenses: parseFloat(formData.operatingExpenses) || 0,
                    cash_balance: parseFloat(formData.cashBalance) || 0,
                    monthly_burn_rate: parseFloat(formData.monthlyBurnRate) || 0,
                    currency: formData.currency,
                },
                qualitative: {
                    problem_description: formData.problemDescription,
                    target_customer_persona: formData.targetCustomerPersona,
                    current_alternatives: formData.currentAlternatives,
                    why_now: formData.whyNow,
                    product_description: formData.productDescription,
                    demo_url: formData.demoUrl || null,
                    users_count: formData.usersCount ? parseInt(formData.usersCount) : null,
                    retention_metrics: formData.retentionMetrics || null,
                    competitors: formData.competitors,
                    differentiation: formData.differentiation,
                    why_you_win: formData.whyYouWin,
                    founder_background: formData.founderBackground,
                    domain_experience: formData.domainExperience,
                    past_wins_failures: formData.pastWinsFailures || null,
                },
                metadata: {
                    submitted_at: new Date().toISOString(),
                    version: "2.0",
                },
            };
            localStorage.removeItem("evaluation-draft");
            onSubmit?.(outputData);
        }
    };

    const handleMagicFill = (extractedData) => {
        setFormData(prev => ({
            ...prev,
            ...extractedData,
            // Ensure numeric fields are preserved if not extracted
            // (The extraction service skips metrics, so we keep defaults or existing)
        }));
        // Move to Step 1 to show the magic
        setCurrentStep(1);
    };

    // ─── Render ───────────────────────────────────────────

    return (
        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
            {/* Main Form */}
            <div className="space-y-6">
                {/* Progress */}
                <Card className="border-border" style={{ backgroundColor: 'transparent' }}>
                    <CardContent className="py-6 flex justify-between items-center bg-card/50">
                        <StepProgress
                            currentStep={currentStep}
                            completedSteps={completedSteps}
                            onStepClick={setCurrentStep}
                        />
                        <div className="ml-4">
                            <MagicFill onFill={handleMagicFill} />
                        </div>
                    </CardContent>
                </Card>

                {/* Form Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="border-border" style={{ backgroundColor: 'transparent' }}>
                            <CardHeader className="border-b border-border px-6 py-5">
                                <CardTitle className="text-xl font-semibold">
                                    {STEP_TITLES[currentStep]}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">

                                {/* ── Step 1: Identity ───────────────── */}
                                {currentStep === 1 && (
                                    <>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <FormField
                                                label="Startup Name"
                                                required

                                                error={errors.startupName}
                                            >
                                                <Input
                                                    name="startupName"
                                                    value={formData.startupName}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Acme Technologies"
                                                    className="h-11"
                                                />
                                            </FormField>

                                            <FormField
                                                label="Website"

                                                error={errors.website}
                                            >
                                                <Input
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleInputChange}
                                                    placeholder="https://example.com"
                                                    className="h-11"
                                                />
                                            </FormField>
                                        </div>

                                        <FormField
                                            label="Tagline"
                                            description="A one-liner that describes what your startup does"
                                            required

                                            error={errors.tagline}
                                            characterCount={formData.tagline.length}
                                            maxCharacters={100}
                                        >
                                            <Input
                                                name="tagline"
                                                value={formData.tagline}
                                                onChange={handleInputChange}
                                                placeholder="We help X do Y with Z"
                                                className="h-11"
                                            />
                                        </FormField>

                                        <div className="grid md:grid-cols-3 gap-6">
                                            <FormField
                                                label="Industry"
                                                required

                                                error={errors.industry}
                                            >
                                                <FormSelect
                                                    name="industry"
                                                    value={formData.industry}
                                                    onChange={handleInputChange}
                                                    options={INDUSTRIES}
                                                    placeholder="Select industry"
                                                />
                                            </FormField>

                                            <FormField
                                                label="Stage"
                                                required

                                                error={errors.stage}
                                            >
                                                <FormSelect
                                                    name="stage"
                                                    value={formData.stage}
                                                    onChange={handleInputChange}
                                                    options={STAGES}
                                                    placeholder="Select stage"
                                                />
                                            </FormField>

                                            <FormField
                                                label="Founded Date"

                                                error={errors.foundedDate}
                                            >
                                                <Input
                                                    name="foundedDate"
                                                    type="date"
                                                    value={formData.foundedDate}
                                                    onChange={handleInputChange}
                                                    className="h-11"
                                                />
                                            </FormField>
                                        </div>
                                    </>
                                )}

                                {/* ── Step 2: Problem & Customer ───── */}
                                {currentStep === 2 && (
                                    <>
                                        <FormField
                                            label="Problem Description"
                                            description="Describe the core problem your startup is solving in detail"
                                            required

                                            error={errors.problemDescription}
                                            characterCount={formData.problemDescription.length}
                                            maxCharacters={1000}
                                        >
                                            <FormTextarea
                                                name="problemDescription"
                                                value={formData.problemDescription}
                                                onChange={handleInputChange}
                                                placeholder="Describe the pain point, who experiences it, and how severe it is..."
                                                rows={5}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Target Customer Persona"
                                            description="Who is your ideal customer? Be specific about demographics and psychographics"
                                            required

                                            error={errors.targetCustomerPersona}
                                        >
                                            <FormTextarea
                                                name="targetCustomerPersona"
                                                value={formData.targetCustomerPersona}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Mid-market SaaS companies with 50-200 employees..."
                                                rows={4}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Current Alternatives"
                                            description="What are customers using today to solve this problem?"
                                            required

                                            error={errors.currentAlternatives}
                                        >
                                            <FormTextarea
                                                name="currentAlternatives"
                                                value={formData.currentAlternatives}
                                                onChange={handleInputChange}
                                                placeholder="List existing solutions, workarounds, or competitors..."
                                                rows={3}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Why Now"
                                            description="What has changed that makes this the right time for your solution?"
                                            required

                                            error={errors.whyNow}
                                        >
                                            <FormTextarea
                                                name="whyNow"
                                                value={formData.whyNow}
                                                onChange={handleInputChange}
                                                placeholder="Regulatory changes, technology shifts, market timing..."
                                                rows={3}
                                            />
                                        </FormField>
                                    </>
                                )}

                                {/* ── Step 3: Financials ────────────── */}
                                {currentStep === 3 && (
                                    <>
                                        {/* Info Banner */}
                                        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                            <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Financial Data Required</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    These numbers feed directly into our deterministic financial engine.
                                                    Enter accurate figures for the most recent reporting period. All values in {formData.currency}.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Reporting Period */}
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <FormField
                                                label="Period Start"
                                                description="Start of reporting period"
                                                required

                                                error={errors.periodStart}
                                            >
                                                <Input
                                                    name="periodStart"
                                                    type="date"
                                                    value={formData.periodStart}
                                                    onChange={handleInputChange}
                                                    className="h-11"
                                                />
                                            </FormField>

                                            <FormField
                                                label="Period End"
                                                description="End of reporting period"
                                                required

                                                error={errors.periodEnd}
                                            >
                                                <Input
                                                    name="periodEnd"
                                                    type="date"
                                                    value={formData.periodEnd}
                                                    onChange={handleInputChange}
                                                    className="h-11"
                                                />
                                            </FormField>

                                            <FormField
                                                label="Currency"
                                                required

                                                error={errors.currency}
                                            >
                                                <FormSelect
                                                    name="currency"
                                                    value={formData.currency}
                                                    onChange={handleInputChange}
                                                    options={CURRENCIES}
                                                    placeholder="Select currency"
                                                />
                                            </FormField>
                                        </div>

                                        {/* Revenue & Costs */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <FormCurrencyInput
                                                name="revenue"
                                                label="Total Revenue"
                                                description="Total revenue for the reporting period"
                                                error={errors.revenue}
                                                placeholder="e.g., 250000"
                                                icon={DollarSign}
                                                value={formData.revenue}
                                                onChange={handleInputChange}
                                            />
                                            <FormCurrencyInput
                                                name="cogs"
                                                label="Cost of Goods Sold (COGS)"
                                                description="Direct costs attributable to production"
                                                error={errors.cogs}
                                                placeholder="e.g., 75000"
                                                icon={DollarSign}
                                                value={formData.cogs}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-6">
                                            <FormCurrencyInput
                                                name="operatingExpenses"
                                                label="Operating Expenses"
                                                description="Salaries, rent, marketing, etc."
                                                error={errors.operatingExpenses}
                                                placeholder="e.g., 120000"
                                                icon={DollarSign}
                                                value={formData.operatingExpenses}
                                                onChange={handleInputChange}
                                            />
                                            <FormCurrencyInput
                                                name="cashBalance"
                                                label="Current Cash Balance"
                                                description="Cash in bank right now"
                                                error={errors.cashBalance}
                                                placeholder="e.g., 500000"
                                                icon={DollarSign}
                                                value={formData.cashBalance}
                                                onChange={handleInputChange}
                                            />
                                            <FormCurrencyInput
                                                name="monthlyBurnRate"
                                                label="Monthly Burn Rate"
                                                description="Average net cash outflow per month"
                                                error={errors.monthlyBurnRate}
                                                placeholder="e.g., 40000"
                                                icon={TrendingUp}
                                                value={formData.monthlyBurnRate}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* ── Step 4: Product & Traction ───── */}
                                {currentStep === 4 && (
                                    <>
                                        <FormField
                                            label="Product Description"
                                            description="Describe your product and how it solves the problem"
                                            required

                                            error={errors.productDescription}
                                        >
                                            <FormTextarea
                                                name="productDescription"
                                                value={formData.productDescription}
                                                onChange={handleInputChange}
                                                placeholder="Our product is a [category] that [key functionality]..."
                                                rows={4}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Demo URL"
                                            description="Link to a demo, video walkthrough, or live product"

                                            error={errors.demoUrl}
                                        >
                                            <Input
                                                name="demoUrl"
                                                value={formData.demoUrl}
                                                onChange={handleInputChange}
                                                placeholder="https://demo.example.com"
                                                className="h-11"
                                            />
                                        </FormField>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <FormField
                                                label="Users / Customers"

                                                error={errors.usersCount}
                                            >
                                                <Input
                                                    name="usersCount"
                                                    type="number"
                                                    value={formData.usersCount}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., 1000"
                                                    className="h-11"
                                                />
                                            </FormField>

                                            <FormField
                                                label="Retention Rate"

                                                error={errors.retentionMetrics}
                                            >
                                                <Input
                                                    name="retentionMetrics"
                                                    value={formData.retentionMetrics}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., 85% monthly"
                                                    className="h-11"
                                                />
                                            </FormField>
                                        </div>
                                    </>
                                )}

                                {/* ── Step 5: Market & Competition ── */}
                                {currentStep === 5 && (
                                    <>
                                        <FormField
                                            label="Competitors"
                                            description="List your main competitors (direct and indirect)"
                                            required

                                            error={errors.competitors}
                                        >
                                            <FormTextarea
                                                name="competitors"
                                                value={formData.competitors}
                                                onChange={handleInputChange}
                                                placeholder="List competitors with brief description of each..."
                                                rows={4}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Differentiation"
                                            description="What makes you fundamentally different from competitors?"
                                            required

                                            error={errors.differentiation}
                                        >
                                            <FormTextarea
                                                name="differentiation"
                                                value={formData.differentiation}
                                                onChange={handleInputChange}
                                                placeholder="Our unique advantage is..."
                                                rows={4}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Why You Win"
                                            description="Why will you beat the competition? What's your unfair advantage?"
                                            required

                                            error={errors.whyYouWin}
                                        >
                                            <FormTextarea
                                                name="whyYouWin"
                                                value={formData.whyYouWin}
                                                onChange={handleInputChange}
                                                placeholder="We will win because..."
                                                rows={4}
                                            />
                                        </FormField>
                                    </>
                                )}

                                {/* ── Step 6: Team ──────────────────── */}
                                {currentStep === 6 && (
                                    <>
                                        <FormField
                                            label="Founder Background"
                                            description="Tell us about the founding team's experience and qualifications"
                                            required

                                            error={errors.founderBackground}
                                        >
                                            <FormTextarea
                                                name="founderBackground"
                                                value={formData.founderBackground}
                                                onChange={handleInputChange}
                                                placeholder="Previous roles, education, notable achievements..."
                                                rows={4}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Domain Experience"
                                            description="What specific experience does the team have in this industry?"
                                            required

                                            error={errors.domainExperience}
                                        >
                                            <FormTextarea
                                                name="domainExperience"
                                                value={formData.domainExperience}
                                                onChange={handleInputChange}
                                                placeholder="Years in industry, relevant projects, network..."
                                                rows={3}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Past Wins & Failures"
                                            description="Share relevant wins or lessons learned from past ventures (optional)"

                                            error={errors.pastWinsFailures}
                                        >
                                            <FormTextarea
                                                name="pastWinsFailures"
                                                value={formData.pastWinsFailures}
                                                onChange={handleInputChange}
                                                placeholder="Previous startups, exits, failures and what you learned..."
                                                rows={4}
                                            />
                                        </FormField>
                                    </>
                                )}

                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className="gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={saveDraft}
                            disabled={isSaving}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {isSaving ? "Saving..." : "Save Draft"}
                        </Button>

                        {currentStep < TOTAL_STEPS ? (
                            <Button onClick={handleNext} className="gap-2">
                                Continue
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} className="gap-2">
                                <Send className="h-4 w-4" />
                                Submit Evaluation
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block space-y-6">
                <Card className="border-border sticky top-24" style={{ backgroundColor: 'transparent' }}>
                    <CardHeader className="border-b border-border px-5 py-4">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Application Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <ConfidenceIndicator sections={getSectionCompletion()} />
                        {lastSaved && (
                            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Last saved: {lastSaved.toLocaleTimeString()}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
