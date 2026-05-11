"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const MODE_MAP: Record<string, string> = {
  resume: "job",
  admissions: "college",
  interview: "interview",
};

const AGENT_STEPS = [
  {
    id: "ats",
    label: "Technical Analyst",
    sub: "Scanning keywords, structure & scoring",
    icon: "⚙",
  },
  {
    id: "manager",
    label: "Human Lens",
    sub: "Reading between the lines",
    icon: "◎",
  },
  {
    id: "insider",
    label: "Insider Perspective",
    sub: "Checking culture & unstated rules",
    icon: "◈",
  },
  {
    id: "judge",
    label: "Lead Evaluator",
    sub: "Synthesizing the final verdict",
    icon: "✦",
  },
];

type StepStatus = "waiting" | "running" | "done";

function ProcessingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get("mode") || "resume";

  const [statuses, setStatuses] = useState<StepStatus[]>(["waiting", "waiting", "waiting", "waiting"]);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const hasFetched = useRef(false);

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const doc = sessionStorage.getItem("frankly_doc") || "";
    const target = sessionStorage.getItem("frankly_target") || "";

    if (!doc || !target) {
      router.push(`/audit?mode=${mode}`);
      return;
    }

    const backendMode = MODE_MAP[mode] || "job";

    // Start parallel agents animation
    setStatuses(["running", "running", "running", "waiting"]);

    fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume: doc, target_text: target, mode: backendMode }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        // Parallel agents done → judge running
        setStatuses(["done", "done", "done", "running"]);

        setTimeout(() => {
          setStatuses(["done", "done", "done", "done"]);
          sessionStorage.setItem("frankly_results", JSON.stringify(data));
          sessionStorage.setItem("frankly_mode", mode);
          setTimeout(() => router.push(`/results?mode=${mode}`), 800);
        }, 900);
      })
      .catch((err) => {
        setError(err.message || "Something went wrong.");
        setStatuses(["waiting", "waiting", "waiting", "waiting"]);
      });
  }, [mode, router]);

  const doneCount = statuses.filter((s) => s === "done").length;

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-center px-8"
      style={{
        background: "radial-gradient(circle at top, #1e293b 0%, #0b0e14 100%)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Logo */}
      <div className="mb-14 text-center">
        <h1 className="logo-signature" style={{ fontSize: "3rem", lineHeight: 1 }}>
          Frankly.
        </h1>
        <p className="text-slate-500 text-xs font-light mt-1 tracking-wide">
          {error ? "Something went wrong." : doneCount === 4 ? "Done. Redirecting..." : "Your panel of experts is reviewing..."}
        </p>
      </div>

      {/* STEP CARDS */}
      <div className="w-full max-w-lg flex flex-col gap-3">
        {AGENT_STEPS.map((step, i) => {
          const status = statuses[i];
          return (
            <StepCard
              key={step.id}
              step={step}
              status={status}
              index={i}
            />
          );
        })}
      </div>

      {/* ELAPSED */}
      {!error && (
        <div className="mt-10 text-slate-600 text-xs tabular-nums">
          {elapsed}s elapsed
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mt-8 text-center">
          <p className="text-red-400 text-sm mb-4 max-w-sm">{error}</p>
          <button
            onClick={() => router.push(`/audit?mode=${mode}`)}
            className="text-slate-400 hover:text-white text-sm underline underline-offset-4 transition-colors"
          >
            ← Go back and try again
          </button>
        </div>
      )}
    </main>
  );
}

function StepCard({ step, status, index }: { step: typeof AGENT_STEPS[0]; status: StepStatus; index: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const isParallel = index < 3;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: `all 0.4s ease ${index * 0.06}s`,
        background:
          status === "running"
            ? "rgba(59,130,246,0.07)"
            : status === "done"
            ? "rgba(16,185,129,0.05)"
            : "rgba(255,255,255,0.02)",
        border:
          status === "running"
            ? "1px solid rgba(59,130,246,0.3)"
            : status === "done"
            ? "1px solid rgba(16,185,129,0.2)"
            : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Icon / Status */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background:
            status === "running"
              ? "rgba(59,130,246,0.15)"
              : status === "done"
              ? "rgba(16,185,129,0.12)"
              : "rgba(255,255,255,0.04)",
          fontSize: status === "done" ? "1rem" : "1.1rem",
          transition: "all 0.3s ease",
        }}
      >
        {status === "done" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : status === "running" ? (
          <Spinner />
        ) : (
          <span style={{ color: "#475569", fontSize: "0.9rem" }}>{step.icon}</span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            style={{
              color: status === "done" ? "#10b981" : status === "running" ? "#93c5fd" : "#64748b",
              fontWeight: 600,
              fontSize: "0.85rem",
              transition: "color 0.3s",
            }}
          >
            {step.label}
          </span>
          {isParallel && status === "running" && (
            <span
              style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: "#3b82f6",
                background: "rgba(59,130,246,0.1)",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              PARALLEL
            </span>
          )}
        </div>
        <p
          style={{
            color: status === "running" ? "#475569" : "#334155",
            fontSize: "0.75rem",
            marginTop: 2,
            transition: "color 0.3s",
          }}
        >
          {step.sub}
        </p>
      </div>

      {/* Status label */}
      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: status === "done" ? "#10b981" : status === "running" ? "#3b82f6" : "#1e293b",
          transition: "color 0.3s",
        }}
      >
        {status === "done" ? "DONE" : status === "running" ? "LIVE" : "—"}
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3b82f6"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense>
      <ProcessingInner />
    </Suspense>
  );
}
