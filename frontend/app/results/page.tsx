"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface AgentResult { output: string; latency_ms: number; tokens: number; }
interface Results {
  agents: { ats: AgentResult; manager: AgentResult; insider: AgentResult };
  judge: AgentResult;
  telemetry: { total_tokens: number; total_latency_ms: number; parallel_time_ms: number };
}

const PANEL_LABELS: Record<string, { ats: string; manager: string; insider: string; color: string; badge: string }> = {
  resume: { ats: "ATS Scan", manager: "Hiring Manager", insider: "Insider View", color: "#3b82f6", badge: "RAW DOCUMENT REVIEW" },
  admissions: { ats: "Admissions Screener", manager: "Committee Professor", insider: "Alumnus Take", color: "#06b6d4", badge: "NARRATIVE DESIGN" },
  interview: { ats: "Compliance Audit", manager: "Philanthropist", insider: "Past Winner", color: "#8b5cf6", badge: "POST-GAME ANALYSIS" },
};

function formatOutput(text: string) {
  return text.split("\n").map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} style={{ height: 8 }} />;

    // Section headers — all caps lines ending in colon
    if (/^[A-Z0-9][A-Z0-9\s\-:#\/]+:$/.test(t) || /^#\d/.test(t)) {
      return (
        <p key={i} style={{ fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.18em", color: "#64748b", marginTop: 16, marginBottom: 6, margin: "16px 0 6px" }}>
          {t}
        </p>
      );
    }
    // Score lines
    if (/^(SCORE|RANK|ELIGIBILITY SCORE):/i.test(t)) {
      return (
        <p key={i} style={{ fontSize: "1.3rem", fontWeight: 800, color: "#f1f5f9", margin: "10px 0 6px" }}>
          {t}
        </p>
      );
    }
    // Bullet/numbered
    if (/^[-•]\s/.test(t) || /^\d+\.\s/.test(t)) {
      return (
        <p key={i} style={{ fontSize: "0.82rem", color: "#94a3b8", paddingLeft: 14, lineHeight: 1.65, marginBottom: 5, borderLeft: "2px solid rgba(255,255,255,0.07)" }}>
          {t}
        </p>
      );
    }
    return (
      <p key={i} style={{ fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.7, marginBottom: 3 }}>
        {t}
      </p>
    );
  });
}

function AgentPanel({ label, data, color, index }: { label: string; data: AgentResult; color: string; index: number }) {
  const [open, setOpen] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 100 + 60);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(14px)",
      transition: `all 0.5s ease ${index * 0.08}s`,
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      overflow: "hidden",
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          background: "transparent",
          border: "none",
          borderBottom: open ? "1px solid rgba(255,255,255,0.06)" : "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Dot */}
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: color,
            display: "inline-block",
            flexShrink: 0,
            boxShadow: `0 0 8px ${color}80`,
          }} />
          {/* Label — gap between dot and text fixed */}
          <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.83rem" }}>{label}</span>
          <span style={{ fontSize: "0.62rem", color: "#334155", marginLeft: 2 }}>
            {(data.latency_ms / 1000).toFixed(1)}s · {data.tokens} tok
          </span>
        </div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s ease", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: "16px 18px 20px", maxHeight: 420, overflowY: "auto" }}>
          {formatOutput(data.output)}
        </div>
      )}
    </div>
  );
}

function JudgePanel({ data, color }: { data: AgentResult; color: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 420); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(18px)",
      transition: "all 0.6s ease 0.35s",
      background: `linear-gradient(135deg, ${color}14 0%, rgba(255,255,255,0.01) 100%)`,
      border: `1px solid ${color}40`,
      borderRadius: 22,
      padding: "28px 32px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <span style={{
          fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.25em",
          color, background: `${color}18`, padding: "4px 12px", borderRadius: 6,
        }}>
          FINAL VERDICT
        </span>
        <div style={{ flex: 1, height: "0.5px", background: `${color}25` }} />
        <span style={{ fontSize: "0.62rem", color: "#334155" }}>
          {(data.latency_ms / 1000).toFixed(1)}s · {data.tokens} tok
        </span>
      </div>
      {formatOutput(data.output)}
    </div>
  );
}

function ResultsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get("mode") || "resume";
  const labels = PANEL_LABELS[mode] || PANEL_LABELS.resume;

  const [results, setResults] = useState<Results | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("frankly_results");
    if (!raw) { router.push("/"); return; }
    setResults(JSON.parse(raw));
    setTimeout(() => setMounted(true), 60);
  }, [router]);

  if (!results) return (
    <main style={{ background: "radial-gradient(ellipse at top, #1e293b 0%, #0b0e14 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <p style={{ color: "#334155" }}>Loading...</p>
    </main>
  );

  const { agents, judge, telemetry } = results;
  const { color } = labels;

  return (
    // KEY FIX: overflowY scroll on the outer, remove overflow:hidden from body via inline
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #1e293b 0%, #0b0e14 65%, #050709 100%)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflowY: "auto",
      overflowX: "hidden",
    }}>
      {/* STICKY NAV */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 40px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(24px)",
        background: "rgba(5,7,9,0.75)",
      }}>
        <button
          onClick={() => router.push(`/audit?mode=${mode}`)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 10, padding: "8px 18px",
            color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600,
            cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#f1f5f9"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
          </svg>
          Edit & Re-run
        </button>

        <h1 className="logo-signature" style={{ fontSize: "2.2rem", lineHeight: 1, margin: 0 }}>Frankly.</h1>

        {/* Telemetry */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "TOKENS", value: telemetry.total_tokens.toLocaleString() },
            { label: "LATENCY", value: `${(telemetry.total_latency_ms / 1000).toFixed(1)}s` },
            { label: "PARALLEL", value: `${(telemetry.parallel_time_ms / 1000).toFixed(1)}s` },
          ].map(t => (
            <div key={t.label} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: "0.58rem", color: "#334155", fontWeight: 700, letterSpacing: "0.12em" }}>{t.label}</span>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700 }}>{t.value}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* PAGE CONTENT — scrolls freely */}
      <div style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "40px 40px 80px",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>
        {/* Page title */}
        <div style={{ marginBottom: 32 }}>
          <span style={{
            fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.25em",
            color, background: `${color}18`, padding: "4px 12px", borderRadius: 6,
          }}>
            {labels.badge}
          </span>
          <h2 style={{ color: "#f1f5f9", fontSize: "1.8rem", fontWeight: 800, margin: "12px 0 6px" }}>
            Your Expert Panel Report
          </h2>
          <p style={{ color: "#334155", fontSize: "0.8rem", margin: 0 }}>
            3 agents ran in parallel · synthesized into one verdict
          </p>
        </div>

        {/* 3 agent panels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
          <AgentPanel label={labels.ats} data={agents.ats} color={color} index={0} />
          <AgentPanel label={labels.manager} data={agents.manager} color={color} index={1} />
          <AgentPanel label={labels.insider} data={agents.insider} color={color} index={2} />
        </div>

        {/* Judge */}
        <JudgePanel data={judge} color={color} />

        {/* Footer */}
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <button
            onClick={() => { sessionStorage.clear(); router.push("/"); }}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 12, padding: "12px 36px",
              color: "#64748b", fontSize: "0.82rem", fontWeight: 600,
              cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#64748b"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
          >
            ← Start a New Audit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsInner />
    </Suspense>
  );
}
