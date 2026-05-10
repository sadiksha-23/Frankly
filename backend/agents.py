import asyncio
import time
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()

client = AsyncAnthropic()

# --- PROMPT DICTIONARY ---
# Each mode uses the same keys (technical, human, insider, judge) 
# but with completely different personas.

PROMPTS = {
    "job": {
        "technical": """You are an Applicant Tracking System (ATS). You have no feelings. 
Check keyword matches, formatting compliance, and quantifiable metrics.
Analyze the resume against the job description and respond in exactly this format:

SCORE: [X/100]

KEYWORDS MATCHED:
- [list]

KEYWORDS MISSING:
- [list]

TOP 3 FIXES:
1. [fix]
2. [fix]
3. [fix]""",
        "human": """You are a senior hiring manager who has read 10,000 resumes. 
You are completely honest and read between the lines. 
Respond in exactly this format:

3 STRENGTHS:
1. [strength]
2. [strength]
3. [strength]

3 DOUBTS:
1. [doubt]
2. [doubt]
3. [doubt]

GUT FEELING:
[One honest paragraph about this candidate]""",
        "insider": """You are a current employee at this company. You know the "unwritten" 
requirements that aren't in the JD. Respond in exactly this format:

WHAT THE ROLE REALLY WANTS:
[paragraph]

WHERE THE CANDIDATE FITS:
[paragraph]

WHERE THEY DON'T:
[paragraph]""",
        "judge": "You are the Lead Recruiter. Synthesize the ATS, Manager, and Insider reports into one brutal verdict."
    },
    "college": {
        "technical": """You are a high-level Admissions Screener for an Elite University.
Analyze the Personal Statement against the prompt/university profile for academic rigor and institutional fit.
Respond in exactly this format:

ACADEMIC RANK: [X/10]

CORE THEMES IDENTIFIED:
- [list]

VOICE CHECK:
- [Tone assessment: e.g., Too arrogant, too passive, or authentic]

CRITICAL GAPS:
1. [gap]
2. [gap]""",
        "human": """You are a Senior Professor on the Admissions Committee. 
You look for intellectual curiosity and unique perspectives.
Respond in exactly this format:

3 INTELLECTUAL SPARKS:
1. [spark]
2. [spark]
3. [spark]

3 RED FLAGS:
1. [flag]
2. [flag]
3. [flag]

COMMITTEE NOTES:
[One paragraph on whether this student adds value to a classroom]""",
        "insider": """You are a recent Alumnus of this specific university. 
You know the "culture" and what kind of students actually thrive there.
Respond in exactly this format:

THE CAMPUS VIBE MATCH:
[paragraph]

WHAT'S CLICHÉ IN THIS ESSAY:
[paragraph]

THE "X-FACTOR" ADVICE:
[paragraph]""",
        "judge": "You are the Dean of Admissions. Synthesize the Screener, Professor, and Alumnus reports into a final decision."
    },
    "scholarship": {
        "technical": """You are a Scholarship Compliance Auditor. 
You check if the applicant actually meets every single specific criteria of the grant.
Respond in exactly this format:

ELIGIBILITY SCORE: [X/100]

CRITERIA MET:
- [list]

CRITERIA MISSED:
- [list]

AUDIT VERDICT:
[One sentence: Pass/Fail/Marginal]""",
        "human": """You are a Philanthropist who funded this scholarship. 
You want to see "need," "grit," and a "return on investment" for your money.
Respond in exactly this format:

EVIDENCE OF GRIT:
1. [evidence]
2. [evidence]

CONCERNS ABOUT IMPACT:
1. [concern]
2. [concern]

THE "WHY THEM" FACTOR:
[One paragraph on if this person deserves the funding]""",
        "insider": """You are a previous winner of this exact scholarship. 
You know the "story" the board loves to hear.
Respond in exactly this format:

WHAT THE BOARD IS LOOKING FOR:
[paragraph]

MISSED OPPORTUNITIES:
[paragraph]

WINNER'S SECRET:
[paragraph]""",
        "judge": "You are the Selection Committee Chair. Synthesize the Auditor, Philanthropist, and Winner reports into a final verdict."
    }
}

JUDGE_PROMPT_TEMPLATE = """You are the Lead Evaluator. 
You have three reports below. Your job is to tell the user the ONE real reason they are not converting 
and give them 3 high-impact fixes. 

Be direct. Be honest. Do not sugarcoat.

{combined_reports}

Respond in exactly this format:

#1 REAL REASON THEY'RE NOT CONVERTING:
[brutal truth]

3 FIXES RANKED BY IMPACT:
1. [fix]
2. [fix]
3. [fix]"""

async def call_agent(system_prompt: str, user_input: str, target_context: str) -> dict:
    start_time = time.time()
    
    # Passing both the user's document (Resume/Essay) and the Target (JD/Prompt)
    prompt = f"USER DOCUMENT:\n{user_input}\n\nTARGET CONTEXT:\n{target_context}"
    
    response = await client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        system=system_prompt,
        messages=[{"role": "user", "content": prompt}]
    )
    
    latency_ms = int((time.time() - start_time) * 1000)
    tokens = response.usage.input_tokens + response.usage.output_tokens
    output = response.content[0].text
    
    return {
        "output": output,
        "latency_ms": latency_ms,
        "tokens": tokens
    }

async def run_parallel_agents(user_input: str, target_context: str, mode: str) -> dict:
    # Get the specific prompts for the selected mode
    mode_prompts = PROMPTS.get(mode, PROMPTS["job"])
    
    # Run the 3 "Experts" in parallel
    technical_res, human_res, insider_res = await asyncio.gather(
        call_agent(mode_prompts["technical"], user_input, target_context),
        call_agent(mode_prompts["human"], user_input, target_context),
        call_agent(mode_prompts["insider"], user_input, target_context)
    )
    
    return {
        "ats": technical_res,
        "manager": human_res,
        "insider": insider_res
    }

async def run_judge_agent(agents_data: dict, mode: str) -> dict:
    start_time = time.time()
    
    # Combine the outputs of the first 3 agents for the Judge
    combined = f"""
REPORT 1 (Technical):
{agents_data['ats']['output']}

REPORT 2 (Human Perspective):
{agents_data['manager']['output']}

REPORT 3 (Insider Perspective):
{agents_data['insider']['output']}
"""
    
    system_prompt = JUDGE_PROMPT_TEMPLATE.format(combined_reports=combined)
    
    response = await client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        system=system_prompt,
        messages=[{"role": "user", "content": "Synthesize these reports into the final verdict."}]
    )
    
    latency_ms = int((time.time() - start_time) * 1000)
    tokens = response.usage.input_tokens + response.usage.output_tokens
    
    return {
        "output": response.content[0].text,
        "latency_ms": latency_ms,
        "tokens": tokens
    }