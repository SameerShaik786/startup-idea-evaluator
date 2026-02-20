<p align="center">
  <h1 align="center">IdeaEvaluator</h1>
  <p align="center">
    <strong>LLM-Orchestrated Startup Evaluation Workflow System</strong>
  </p>
  <p align="center">
    A multi-agent workflow platform that coordinates domain-specific analysis tasks using Microsoft's AutoGen framework and external tools to generate structured startup evaluation reports.
  </p>
</p>

---

## Overview

IdeaEvaluator is a full-stack evaluation platform that uses Microsoft's AutoGen multi-agent framework to coordinate startup analysis workflows across multiple domains such as financial health, market potential, competition, and risk.

Instead of performing sequential analysis, the system decomposes evaluation into independent domain-specific tasks executed through role-based agents. These tasks run concurrently using asynchronous execution pipelines to improve evaluation turnaround time.

A deterministic scoring engine aggregates structured agent outputs to produce consistent evaluation reports for investor review.

---

## Evaluation Workflow

The system executes a staged evaluation pipeline:

1. Founder submits startup and financial data.
2. Input validation is performed using schema-based checks.
3. Independent analysis agents are initialized for:
   - Financial analysis
   - Market estimation
   - Competition assessment
4. Analysis tasks are executed concurrently.
5. Intermediate outputs are aggregated.
6. A deterministic scoring engine computes final scores.
7. Consolidated report is generated and persisted.

Long-running agent tasks are handled asynchronously to avoid blocking API execution during external model inference.

Tool invocation failures are isolated to individual agents, allowing partial evaluation results without terminating the entire workflow.

---

## Features

- Multi-agent evaluation across Financial, Market, Competition, Risk, Longevity, Validation, and Investor Fit domains
- Parallel execution using asyncio-based pipelines
- Founder data validation before initiating evaluation workflows
- Deterministic scoring engine for consistent investment scoring
- Structured report generation with domain-level insights
- Evaluation persistence using PostgreSQL (Supabase)
- Role-based authentication for Founders and Investors

---

## Tech Stack

### Frontend
- Next.js
- React
- TailwindCSS
- Recharts
- Supabase Auth

### Backend
- FastAPI
- Microsoft AutoGen
- Python asyncio
- Pydantic (Input & Output Validation)
- PostgreSQL (Supabase)

### Infrastructure
- Supabase (Auth + Database)
- Groq Cloud (LLM Inference)

---

## System Architecture

Frontend (Next.js) interacts with a FastAPI backend that orchestrates a multi-agent evaluation pipeline.

The backend follows a layered execution structure:

1. Input validation using Pydantic models
2. Agent initialization via AutoGen runtime
3. Parallel execution of domain-specific analysis tasks
4. Aggregation of intermediate outputs
5. Deterministic scoring (No LLM involvement)
6. Report generation
7. Persistence to PostgreSQL

---

## Multi-Agent Pipeline

The evaluation pipeline uses role-based AutoGen agents:

| Agent | Domain |
|-------|--------|
| Validator Agent | Data consistency and completeness |
| Financial Agent | Financial health analysis |
| Market Agent | TAM/SAM/SOM estimation |
| Competition Agent | Competitive landscape assessment |
| Risk Agent | Risk identification |
| Longevity Agent | Survival likelihood estimation |
| Investor Fit Agent | Investor-stage alignment |

Agents in downstream stages receive merged context from upstream analysis outputs.

---

## Reliability & Execution Design

- Agent execution is isolated to prevent full pipeline failure.
- External tool failures trigger retry logic.
- Partial results are returned when specific domain analysis fails.
- Structured outputs are enforced using Pydantic schemas.
- Intermediate agent outputs are persisted for consistency across evaluation stages.
- Asynchronous execution is used for long-running analysis tasks.

---

## Scoring Engine

Final evaluation score is computed using a deterministic weighted formula:

- Financial Health → 30%
- Risk (inverted) → 30%
- Market Growth → 20%
- Validation Quality → 20%

Risk Labels:
- LOW_RISK
- MEDIUM_RISK
- HIGH_RISK

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase Project
- Groq API Key

### Clone Repository

```bash
git clone https://github.com/SameerShaik786/startup-idea-evaluator.git
cd startup-idea-evaluator