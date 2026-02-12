from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from uuid import UUID, uuid4

# --- Base Models ---

class BaseSchema(BaseModel):
    """Base model for all schemas with versioning and timestamps."""
    schema_version: str = Field(default="1.0.0", description="Schema version")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")

class AgentOutputBase(BaseSchema):
    """Base model for all agent outputs."""
    agent_name: str = Field(..., description="Name of the agent that generated this output")
    agent_version: str = Field(..., description="Version of the agent model used")
    model_name: str = Field(..., description="LLM model used (e.g., gpt-4, claude-3)")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0 and 1")

class ValidatorOutput(AgentOutputBase):
    """Output from the Validator Agent."""
    data_consistency_score: float = Field(..., ge=0.0, le=100.0, description="Score indicating internal data consistency")
    completeness_score: float = Field(..., ge=0.0, le=100.0, description="Score indicating data completeness")
    suspicion_flags: List[str] = Field(default_factory=list, description="List of suspicious data patterns or logical contradictions")
    requires_manual_review: bool = Field(..., description="Flag if human review is strictly required")

# --- Layer 1: Data & Schema Models ---

class StartupContext(BaseSchema):
    """Core startup identity and context."""
    startup_id: UUID = Field(default_factory=uuid4, description="Unique identifier for the startup")
    name: str = Field(..., description="Startup name")
    industry: str = Field(..., description="Primary industry")
    stage: str = Field(..., description="Current stage (e.g., Pre-Seed, Seed, Series A)")
    description: str = Field(..., description="Brief description of the startup")
    website: Optional[str] = Field(None, description="Startup website URL")
    founded_date: Optional[datetime] = Field(None, description="Date founded")

class FinancialRawInput(BaseSchema):
    """Raw financial data input. Immutable."""
    startup_id: UUID = Field(..., description="Associated startup ID")
    period_start: datetime = Field(..., description="Start of the financial period")
    period_end: datetime = Field(..., description="End of the financial period")
    revenue: float = Field(..., description="Total revenue for the period")
    cogs: float = Field(..., description="Cost of Goods Sold")
    operating_expenses: float = Field(..., description="Total operating expenses")
    cash_balance: float = Field(..., description="Current cash balance")
    monthly_burn_rate: float = Field(..., description="Average monthly burn rate")
    currency: str = Field(default="USD", description="Currency code")
    
    class Config:
        frozen = True # Make immutable

# --- Agent Outputs ---

class FinancialMetricsOutput(AgentOutputBase):
    """Output from the Financial Analysis Agent."""
    ebitda: float = Field(..., description="Earnings Before Interest, Taxes, Depreciation, and Amortization")
    burn_rate: float = Field(..., description="Monthly cash burn rate")
    runway_months: float = Field(..., description="Number of months of runway left")
    arr: float = Field(..., description="Annual Recurring Revenue")
    gross_margin: float = Field(..., description="Gross Margin percentage (0-100)")
    net_margin: float = Field(..., description="Net margin percentage")
    break_even_months: float = Field(..., description="Months to break even")
    financial_health_score: float = Field(..., ge=0.0, le=100.0, description="Overall financial health score (0-100)")
    anomalies: List[str] = Field(default_factory=list, description="List of financial anomalies or risks detected")
    revenue_growth_rate: Optional[float] = Field(None, description="Revenue growth rate vs previous period")
    burn_multiple: Optional[float] = Field(None, description="Burn multiple (Net Burn / Net New ARR)")
    projections: Dict[str, Any] = Field(default_factory=dict, description="Projected metrics for next 12 months")
    analysis_summary: str = Field(..., description="Text summary of financial health")

class RiskFactor(BaseModel):
    category: str = Field(..., description="Risk category (e.g., Market, Product, Team)")
    description: str = Field(..., description="Description of the risk")
    impact: str = Field(..., description="Potential impact (Low, Medium, High)")
    probability: str = Field(..., description="Probability (Low, Medium, High)")
    mitigation_strategy: str = Field(..., description="Suggested mitigation")

class RiskAssessmentOutput(AgentOutputBase):
    """Output from the Risk Assessment Agent."""
    top_risks: List[str] = Field(..., description="List of top identified risks")
    risk_severity_score: float = Field(..., ge=0.0, le=100.0, description="Aggregate risk severity (0=Safe, 100=Critical)")
    executive_risk_summary: str = Field(..., description="High-level risk summary")

class Competitor(BaseModel):
    name: str
    strength: str
    weakness: str
    market_share_est: Optional[str]

class MarketOutput(AgentOutputBase):
    """Output from the Market Research Agent."""
    tam_estimate: float = Field(..., description="Total Addressable Market estimate in USD")
    sam_estimate: float = Field(..., description="Serviceable Available Market estimate in USD")
    som_estimate: float = Field(..., description="Serviceable Obtainable Market estimate in USD")
    market_growth_score: float = Field(..., ge=0.0, le=100.0, description="Market growth potential score (0-100)")
    competitors: List[Competitor] = Field(default_factory=list, description="Key competitors (Optional)")
    market_trends: List[str] = Field(default_factory=list, description="Relevant market trends (Optional)")

class CompetitionOutput(AgentOutputBase):
    """Output from the Competition Agent."""
    competitor_risk_score: float = Field(..., ge=0.0, le=100.0, description="Risk score based on competitive density (0-100)")
    novelty_score: float = Field(..., ge=0.0, le=100.0, description="Score indicating uniqueness of the solution (0-100)")
    similar_companies: List[str] = Field(default_factory=list, description="List of similar companies or direct competitors")

class LongevityOutput(AgentOutputBase):
    """Output from the Longevity Agent."""
    survival_probability_3yr: float = Field(..., ge=0.0, le=100.0, description="Probability of surviving 3 years (0-100)")
    survival_probability_5yr: float = Field(..., ge=0.0, le=100.0, description="Probability of surviving 5 years (0-100)")
    reasoning: str = Field(..., description="Explanation for independent survival probabilities")

class InvestorFitOutput(AgentOutputBase):
    """Output from the Investor Fit Agent."""
    recommended_investor_type: str = Field(..., description="Type of investor (e.g., Angel, VC, PE)")
    recommended_stage: str = Field(..., description="Funding stage (e.g., Pre-Seed, Seed, Series A)")
    ticket_size_range: str = Field(..., description="Recommended ticket size range (e.g., $100k-$500k)")
    reasoning: str = Field(..., description="Reasoning for the recommendation")
    domain_analysis: Optional[List[Dict[str, str]]] = Field(default_factory=list, description="Breakdown of analysis across all 7 domains")

class ReportSection(BaseModel):
    title: str
    content: str
    score: Optional[int]

class ReportOutput(AgentOutputBase):
    """Final consolidated report."""
    startup_id: UUID
    overall_score: int = Field(..., ge=0, le=100, description="Final evaluation score")
    sections: List[ReportSection] = Field(default_factory=list, description="Detailed report sections")
    recommendation: str = Field(..., description="Final recommendation (e.g., Invest, Watch, Pass)")
    generated_at: datetime = Field(default_factory=datetime.utcnow)
