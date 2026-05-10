import asyncio
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents import run_parallel_agents, run_judge_agent

app = FastAPI()

# Standard CORS setup for your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Added 'mode' to the request model
class AnalyzeRequest(BaseModel):
    resume: str
    target_text: str  # This is the JD, Prompt, or Criteria
    mode: str         # "job", "college", or "scholarship"

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    # Validation
    if not request.resume.strip() or not request.target_text.strip():
        raise HTTPException(
            status_code=400, 
            detail="Both the document and the target context are required."
        )
    
    if request.mode not in ["job", "college", "scholarship"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid mode selected."
        )

    total_start = time.time()

    # Phase 1: Parallel Orchestration
    # We pass the mode into run_parallel_agents so it selects the right experts
    parallel_start = time.time()
    agents = await run_parallel_agents(request.resume, request.target_text, request.mode)
    parallel_time_ms = int((time.time() - parallel_start) * 1000)

    # Phase 2: Sequential Synthesis (The Judge)
    judge = await run_judge_agent(agents, request.mode)

    # Telemetry Calculation
    total_latency_ms = int((time.time() - total_start) * 1000)
    
    total_tokens = (
        agents["ats"]["tokens"] +
        agents["manager"]["tokens"] +
        agents["insider"]["tokens"] +
        judge["tokens"]
    )

    return {
        "agents": {
            "ats": agents["ats"],
            "manager": agents["manager"],
            "insider": agents["insider"]
        },
        "judge": judge,
        "telemetry": {
            "total_tokens": total_tokens,
            "total_latency_ms": total_latency_ms,
            "parallel_time_ms": parallel_time_ms
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)