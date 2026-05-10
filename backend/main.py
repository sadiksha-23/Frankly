import asyncio
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents import run_parallel_agents, run_judge_agent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    resume: str
    job_description: str

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    if not request.resume.strip() or not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Resume and job description are required")

    total_start = time.time()

    parallel_start = time.time()
    agents = await run_parallel_agents(request.resume, request.job_description)
    parallel_time_ms = int((time.time() - parallel_start) * 1000)

    judge = await run_judge_agent(
        agents["ats"]["output"],
        agents["manager"]["output"],
        agents["insider"]["output"]
    )

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