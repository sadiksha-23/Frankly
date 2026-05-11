# 🤖 FRANKLY. - The Brutal Honest Advisor

**A Multi-Agent Application Feedback Platform**

Frankly. is an AI-powered platform designed to provide unfiltered, high-impact feedback on job resumes, interview performance, and college essays. By orchestrating four Claude 3.5 Sonnet agents in a parallel-then-sequential architecture, the platform delivers diverse perspectives before a final "Judge" agent synthesizes a brutal, actionable verdict.

## Architecture & Orchestration

The project demonstrates sophisticated LLM orchestration by running three specialized agents concurrently to minimize latency, followed by a fourth synthesis agent.

### 🧩 System Diagram
```text
User Input (Resume + Context)
          │
          ▼
    Next.js 15 App
          │
    (FastAPI Backend)
          │
    ┌─────┴────────────────┐
    │       (Parallel)     │
    ▼           ▼          ▼
Agent 1      Agent 2     Agent 3
(ATS/Scan)  (Manager)   (Insider)
    │           │          │
    └─────┬─────┴──────────┘
          ▼
       Agent 4 (The Judge)
          │
          ▼
    Results Dashboard
```

## ⚙️ Technical Specifications & Project Details

* 🛠 **Tech Stack**
    * Frontend: Next.js 15 (App Router), Tailwind CSS, shadcn/ui.
    * Backend: Python FastAPI, selected for its native support for asynchronous programming (asyncio), critical for parallel LLM calls.
    * AI: Anthropic Claude API (claude-3-5-sonnet-20240620).
    * Orchestration: asyncio.gather() for parallel execution, ensuring the system is only as slow as the slowest single agent.

* 📂 **Project Structure**
```text
    ├── frontend/
    │   ├── app/
    │   │   ├── audit/            # Input dashboard for Resume/JD/Essays
    │   │   ├── processing/       # Checklist of live model orchestration
    │   │   ├── results/          # Final result dashboard page
    │   │   ├── favicon.ico       # Site icon
    │   │   ├── globals.css       # Global styles
    │   │   ├── layout.tsx        # Global theme and navigation
    │   │   └── page.tsx          # Main entry page loader
    │   └── components/           # AgentCard, TelemetryBar, etc.
    └── backend/
    ├── main.py               # FastAPI routes and CORS config
    ├── agents.py             # All 4 agent definitions + orchestration logic
    └── telemetry.py          # Token tracking and latency metrics
  ```

* 🚀 **Getting Started**
    * Prerequisites: Node.js 18+, Python 3.10+, Anthropic API Key.
    * Backend Setup:
      ```bash
      # Navigate to the directory
      cd backend
      
      # Install the necessary dependencies
      pip install -r requirements.txt
      
      # Start the server
      uvicorn main:app --reload
      ```
    * Frontend Setup:
      ```bash
      cd frontend
      npm install
      npm run dev
      ```
    * Access URL: Access URL: Once both servers are running, access the advisor at:
      ```text
      http://localhost:3000
      ```

## 🤖 How I used Claude Code (Agent-Native Development)

I utilized Claude Code to transform this from a concept into a production-ready prototype in under 8 hours. This project proves a "Builder's Mindset" by prioritizing shipping a functional multi-agent system over theoretical design.

* **Architectural Orchestration:** I directed Claude Code to implement `asyncio.gather()` for true parallel agent execution. When the agent initially proposed sequential calls, I provided direct, honest feedback to refactor the orchestration layer for high-performance platform logic.
* **Rapid Troubleshooting:** I used agentic AI to solve a complex systems-level bug involving race conditions in the telemetry layer, ensuring that token counts were accurately attributed to each specific agent call.

## 📊 Key Features & Platform Orchestration

This platform acts as the "Brain" (Logic Center), demonstrating the core requirements for the Fenway Platform Orchestration role.

* **Agentic Orchestration:** Manages three parallel perspectives (ATS, Manager, Insider) and a final Judge synthesis.
* **Real-time Telemetry:** Built-in dashboard tracking latency and token usage, showing familiarity with enterprise-grade monitoring and LLM APIs.
* **Modern Stack:** Built using Next.js 15, TypeScript, and Python—the exact core skills required for Fenway's Agent-Native Systems.
* **Security & Reliability:** Follows engineering fundamentals by incorporating CORS middleware and environment variable protection for API keys.
