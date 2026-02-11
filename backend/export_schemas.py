import os
import json
from models import (
    StartupContext,
    FinancialRawInput,
    FinancialMetricsOutput,
    RiskOutput,
    MarketOutput,
    ReportOutput
)

def export_schemas():
    output_dir = os.path.join(os.path.dirname(__file__), 'schemas')
    os.makedirs(output_dir, exist_ok=True)
    
    models = [
        StartupContext,
        FinancialRawInput,
        FinancialMetricsOutput,
        RiskOutput,
        MarketOutput,
        ReportOutput
    ]
    
    for model in models:
        schema = model.model_json_schema()
        filename = f"{model.__name__}.json"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w') as f:
            json.dump(schema, f, indent=2)
            
        print(f"Exported schema for {model.__name__} to {filepath}")

if __name__ == "__main__":
    export_schemas()
