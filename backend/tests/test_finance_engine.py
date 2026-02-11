import unittest
from datetime import datetime, timedelta
from uuid import uuid4
from backend.models import FinancialRawInput
from backend.finance_engine import FinancialEngine

class TestFinancialEngine(unittest.TestCase):
    
    def setUp(self):
        self.startup_id = uuid4()
        self.base_date = datetime.now()
        self.month_later = self.base_date + timedelta(days=30)
        
        # Scenario 1: Typical Loss-Making Startup
        self.input_loss = FinancialRawInput(
            startup_id=self.startup_id,
            period_start=self.base_date,
            period_end=self.month_later,
            revenue=10000.0,
            cogs=2000.0,
            operating_expenses=12000.0, # Total cost 14000, Loss 4000
            cash_balance=20000.0,
            monthly_burn_rate=4000.0
        )
        
        # Scenario 2: Profitable Startup
        self.input_profit = FinancialRawInput(
            startup_id=self.startup_id,
            period_start=self.base_date,
            period_end=self.month_later,
            revenue=50000.0,
            cogs=10000.0,
            operating_expenses=20000.0, # Total cost 30000, Profit 20000
            cash_balance=100000.0,
            monthly_burn_rate=0.0
        )

        # Scenario 3: Zero Revenue (Pre-revenue)
        self.input_zero_rev = FinancialRawInput(
            startup_id=self.startup_id,
            period_start=self.base_date,
            period_end=self.month_later,
            revenue=0.0,
            cogs=0.0,
            operating_expenses=5000.0,
            cash_balance=10000.0,
            monthly_burn_rate=5000.0
        )

    def test_ebitda(self):
        engine = FinancialEngine(self.input_loss)
        # 10k - 2k - 12k = -4000
        self.assertEqual(engine.calculate_ebitda(), -4000.0)

    def test_gross_margin(self):
        engine = FinancialEngine(self.input_loss)
        # (10k - 2k) / 10k = 80%
        self.assertEqual(engine.calculate_gross_margin(), 80.0)
        
        engine_zero = FinancialEngine(self.input_zero_rev)
        self.assertEqual(engine_zero.calculate_gross_margin(), 0.0)

    def test_net_margin(self):
        engine = FinancialEngine(self.input_profit)
        # Profit 20k / Revenue 50k = 40%
        self.assertEqual(engine.calculate_net_margin(), 40.0)

    def test_burn_rate(self):
        engine = FinancialEngine(self.input_loss)
        # Costs 14k - Rev 10k = 4k Burn
        self.assertEqual(engine.calculate_burn_rate(), 4000.0)
        
        engine_profit = FinancialEngine(self.input_profit)
        # Should be 0 since profitable
        self.assertEqual(engine_profit.calculate_burn_rate(), 0.0)

    def test_runway_logic(self):
        engine = FinancialEngine(self.input_loss)
        # 20k cash / 4k burn = 5 months
        self.assertEqual(engine.calculate_runway(), 5.0)
        
        engine_profit = FinancialEngine(self.input_profit)
        # Infinite runway
        self.assertEqual(engine_profit.calculate_runway(), 999.0)

    def test_arr_calculation(self):
        # 30 day period, 10k revenue
        engine = FinancialEngine(self.input_loss)
        # Daily = 10000/30 = 333.33
        # Yearly = 333.33 * 365 = 121666.66...
        expected = (10000.0 / 30.0) * 365
        self.assertAlmostEqual(engine.calculate_arr(), expected, places=2)

    def test_break_even_projection(self):
        engine = FinancialEngine(self.input_loss)
        # Current Rev 10k, Expenses 14k.
        # If we grow 10% monthly:
        # M1: 11k
        # M2: 12.1k
        # M3: 13.31k
        # M4: 14.64k -> Breakeven
        self.assertEqual(engine.calculate_break_even_months(monthly_growth_rate=0.10), 4.0)

if __name__ == '__main__':
    unittest.main()
