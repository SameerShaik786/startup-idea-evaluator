from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from backend.models import FinancialRawInput

class CalculatedFinancials(BaseModel):
    """Output model for deterministic financial calculations."""
    ebitda: float = Field(..., description="Earnings Before Interest, Taxes, Depreciation, and Amortization")
    pat: float = Field(..., description="Profit After Tax")
    gross_margin_percent: float = Field(..., description="Gross Margin Percentage")
    net_margin_percent: float = Field(..., description="Net Margin Percentage")
    burn_rate_monthly: float = Field(..., description="Monthly Burn Rate")
    runway_months: float = Field(..., description="Runway in Months")
    arr: float = Field(..., description="Annualized Revenue Run Rate")
    break_even_months: float = Field(..., description="Estimated months to break even (999 if unreachable)")

class FinancialEngine:
    def __init__(self, raw_input: FinancialRawInput):
        self.raw = raw_input

    def calculate_ebitda(self) -> float:
        """Revenue - COGS - Operating Expenses"""
        return self.raw.revenue - self.raw.cogs - self.raw.operating_expenses

    def calculate_pat(self) -> float:
        """Revenue - COGS - Operating Expenses (assuming 0 tax/interest for MVP)"""
        # In a real scenario, this would include interest and tax logic.
        return self.calculate_ebitda()
    
    def calculate_gross_margin(self) -> float:
        """(Revenue - COGS) / Revenue"""
        if self.raw.revenue == 0:
            return 0.0
        return ((self.raw.revenue - self.raw.cogs) / self.raw.revenue) * 100

    def calculate_net_margin(self) -> float:
        """PAT / Revenue"""
        if self.raw.revenue == 0:
            return 0.0
        return (self.calculate_pat() / self.raw.revenue) * 100

    def calculate_burn_rate(self) -> float:
        """
        Net Burn = Operating Expenses + COGS - Revenue
        If the company is profitable, burn rate is 0.
        """
        burn = (self.raw.operating_expenses + self.raw.cogs) - self.raw.revenue
        return max(0.0, burn)

    def calculate_runway(self) -> float:
        """Cash Balance / Monthly Burn Rate"""
        burn = self.calculate_burn_rate()
        if burn <= 0:
            return 999.0 # Infinite runway / Profitable
        return self.raw.cash_balance / burn

    def calculate_arr(self) -> float:
        """
        Normalize revenue to yearly.
        Assumes period_start and period_end definitions.
        """
        days = (self.raw.period_end - self.raw.period_start).days
        if days <= 0:
            return 0.0
        
        # Calculate daily revenue and multiply by 365
        daily_revenue = self.raw.revenue / days
        return daily_revenue * 365

    def calculate_break_even_months(self, monthly_growth_rate: float = 0.0) -> float:
        """
        Project when Revenue > Expenses.
        Simple iterative projection. Returns 999 if not reached in 60 months.
        """
        if self.calculate_pat() > 0:
            return 0.0 # Already profitable
            
        current_revenue = self.raw.revenue
        # Assuming expenses stay relatively flat or grow slower, but for MVP keeping absolute expenses flat
        # to find pure revenue catch-up point.
        total_expenses = self.raw.cogs + self.raw.operating_expenses
        
        months = 0
        limit = 60 # Cap at 5 years
        
        while months < limit:
            months += 1
            current_revenue *= (1 + monthly_growth_rate)
            if current_revenue >= total_expenses:
                return float(months)
                
        return 999.0

    def run_analysis(self) -> CalculatedFinancials:
        """Run all calculations and return structured object."""
        return CalculatedFinancials(
            ebitda=self.calculate_ebitda(),
            pat=self.calculate_pat(),
            gross_margin_percent=self.calculate_gross_margin(),
            net_margin_percent=self.calculate_net_margin(),
            burn_rate_monthly=self.calculate_burn_rate(),
            runway_months=self.calculate_runway(),
            arr=self.calculate_arr(),
            break_even_months=self.calculate_break_even_months()
        )
