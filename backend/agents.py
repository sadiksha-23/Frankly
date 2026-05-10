import asyncio
import time
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()

client = AsyncAnthropic()

ATS_PROMPT = """You are an Applicant Tracking System (ATS). You have no feelings. 
You only check keyword matches, formatting compliance, and quantifiable metrics.
Analyze the resume against the job description and respond in exactly this format:

SCORE: [X/100]

KEYWORDS MATCHED:
- [list each one]

KEYWORDS MISSING:
- [list each one]

TOP 3 FIXES:
1. [fix]
2. [fix]
3. [fix]"""

MANAGER_PROMPT = """You are a senior hiring manager who has read 10,000 resumes. 
You are not mean but you are completely honest. You read between the lines. 
You question every vague claim. Respond in exactly this format:

3 STRENGTHS:
1. [strength]
2. [strength]
3. [strength]

3 DOUBTS:
1. [doubt]
2. [doubt]
3. [doubt]

GUT FEELING:
[One honest paragraph about this candidate]"""

INSIDER_PROMPT = """You are someone who works at this type of company and knows 
what the job description is really asking for vs what it says on paper.
Respond in exactly this format:

WHAT THE ROLE REALLY WANTS:
[paragraph]

WHERE THE CANDIDATE FITS:
[paragraph]

WHERE THEY DON'T:
[paragraph]"""

JUDGE_PROMPT = """You are a brutally honest career advisor. You have just read 
feedback from three perspectives: an ATS bot, a hiring manager, and an insider.
Respond in exactly this format:

#1 REAL REASON THEY'RE NOT CONVERTING:
[One brutal, specific sentence]

3 FIXES RANKED BY IMPACT:
1. [most impactful fix]
2. [second fix]
3. [third fix]"""


async def call_agent(system_prompt: str, resume: str, job_description: str) -> dict:
    start = time.time()
    
    response = await client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": f"RESUME:\n{resume}\n\nJOB DESCRIPTION:\n{job_description}"
            }
        ]
    )
    
    latency_ms = int((time.time() - start) * 1000)
    tokens = response.usage.input_tokens + response.usage.output_tokens
    output = response.content[0].text
    
    return {
        "output": output,
        "latency_ms": latency_ms,
        "tokens": tokens
    }


async def run_parallel_agents(resume: str, job_description: str) -> dict:
    ats_result, manager_result, insider_result = await asyncio.gather(
        call_agent(ATS_PROMPT, resume, job_description),
        call_agent(MANAGER_PROMPT, resume, job_description),
        call_agent(INSIDER_PROMPT, resume, job_description)
    )
    
    return {
        "ats": ats_result,
        "manager": manager_result,
        "insider": insider_result
    }


async def run_judge_agent(ats_output: str, manager_output: str, insider_output: str) -> dict:
    start = time.time()
    
    combined = f"""ATS REPORT:\n{ats_output}\n\nHIRING MANAGER REPORT:\n{manager_output}\n\nINSIDER REPORT:\n{insider_output}"""
    
    response = await client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        system=JUDGE_PROMPT,
        messages=[
            {
                "role": "user",
                "content": combined
            }
        ]
    )
    
    latency_ms = int((time.time() - start) * 1000)
    tokens = response.usage.input_tokens + response.usage.output_tokens
    output = response.content[0].text
    
    return {
        "output": output,
        "latency_ms": latency_ms,
        "tokens": tokens
    }