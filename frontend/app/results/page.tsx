"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AgentResult {
  output: string;
  latency_ms: number;
  tokens: number;
}

interface Results {
  agents: {
    ats: AgentResult;
    manager: AgentResult;
    insider: AgentResult;
  };
  judge: AgentResult;
  telemetry: {
    total_tokens: number;
    total_latency_ms: number;
    parallel_time_ms: number;
  };
}

function AgentCard({ name, emoji, result, delay }: {
  name: string;
  emoji: string;
  result: AgentResult;
  delay: string;
}) {
  return (
    <div className={`rounded-2xl p-6 fade-up ${delay}`}
      style={{ background: 'var(--cream)', border: '1.5px solid var(--fog)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <h3 className="font-semibold text-base" style={{ color: 'var(--walnut)' }}>{name}</h3>
        </div>
        <span className="text-xs px-2 py-1 rounded-full"
          style={{ background: 'var(--parchment)', color: 'var(--bark)' }}>
          done
        </span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4"
        style={{ color: 'var(--bark)' }}>
        {result.output}
      </p>
      <div className="flex gap-4 pt-3 text-xs" style={{ borderTop: '1px solid var(--fog)', color: 'var(--clay)' }}>
        <span>⏱ {result.latency_ms}ms</span>
        <span>🔤 {result.tokens} tokens</span>
      </div>
    </div>
  );
}

export default function Results() {
  const router = useRouter();
  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("franklyResults");
    if (!stored) {
      router.push("/");
      return;
    }
    setResults(JSON.parse(stored));
  }, [router]);

  if (!results) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--warm-white)' }}>
      <p style={{ color: 'var(--bark)' }}>Loading results...</p>
    </div>
  );

  return (
    <main className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--fog)' }}>
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--walnut)' }}>Frankly.</h1>
          <button onClick={() => router.push("/")}
            className="text-sm underline underline-offset-4 hover:opacity-70 transition"
            style={{ color: 'var(--clay)' }}>
            ← Analyze another
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Telemetry Bar */}
        <div className="rounded-xl px-6 py-4 mb-8 flex flex-wrap gap-6 fade-up"
          style={{ background: 'var(--parchment)', border: '1.5px solid var(--fog)' }}>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--bark)' }}>Total Tokens</div>
            <div className="font-semibold text-lg" style={{ color: 'var(--walnut)' }}>
              {results.telemetry.total_tokens.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--bark)' }}>Parallel Agent Time</div>
            <div className="font-semibold text-lg" style={{ color: 'var(--walnut)' }}>
              {(results.telemetry.parallel_time_ms / 1000).toFixed(1)}s
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--bark)' }}>Total Time</div>
            <div className="font-semibold text-lg" style={{ color: 'var(--walnut)' }}>
              {(results.telemetry.total_latency_ms / 1000).toFixed(1)}s
            </div>
          </div>
          <div className="ml-auto flex items-center">
            <span className="text-xs px-3 py-1 rounded-full"
              style={{ background: 'var(--moss)', color: 'var(--warm-white)' }}>
              3 agents ran in parallel
            </span>
          </div>
        </div>

        {/* 3 Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <AgentCard name="ATS Scanner" emoji="🤖"
            result={results.agents.ats} delay="fade-up-delay-1" />
          <AgentCard name="Hiring Manager" emoji="👔"
            result={results.agents.manager} delay="fade-up-delay-2" />
          <AgentCard name="The Insider" emoji="🕵️"
            result={results.agents.insider} delay="fade-up-delay-3" />
        </div>

        {/* Judge Card - full width */}
        <div className="rounded-2xl p-8 fade-up fade-up-delay-4"
          style={{ background: 'var(--walnut)', border: '1.5px solid var(--bark)' }}>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">⚖️</span>
            <h3 className="text-xl font-bold" style={{ color: 'var(--cream)' }}>
              The Verdict
            </h3>
            <span className="ml-auto text-xs px-3 py-1 rounded-full"
              style={{ background: 'var(--bark)', color: 'var(--fog)' }}>
              judge
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap mb-6"
            style={{ color: 'var(--parchment)' }}>
            {results.judge.output}
          </p>
          <div className="flex gap-4 text-xs pt-4"
            style={{ borderTop: '1px solid var(--bark)', color: 'var(--clay)' }}>
            <span>⏱ {results.judge.latency_ms}ms</span>
            <span>🔤 {results.judge.tokens} tokens</span>
          </div>
        </div>
      </div>
    </main>
  );
}