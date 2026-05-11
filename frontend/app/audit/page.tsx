"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const MODE_CONFIG = {
  resume: {
    label: "Resume Audit",
    sub: "RAW DOCUMENT REVIEW",
    doc: { title: "Your Resume", placeholder: "Paste your full resume here — every line, every bullet. Don't clean it up. We want the raw version..." },
    target: { title: "Job Description", placeholder: "Paste the full job description here. Include requirements, responsibilities, company blurb — everything..." },
    cta: "Run the Audit",
    color: "#3b82f6",
  },
  interview: {
    label: "Interview Prep",
    sub: "POST-GAME ANALYSIS",
    doc: { title: "Interview Transcript / Notes", placeholder: "Paste your interview transcript or notes from memory. What did they ask? What did you say? Be honest..." },
    target: { title: "Role & Company Context", placeholder: "What role was this for? What company? Any context about how the interview felt, what round it was..." },
    cta: "Analyze the Interview",
    color: "#8b5cf6",
  },
  admissions: {
    label: "Academic Prep",
    sub: "NARRATIVE DESIGN",
    doc: { title: "Your Personal Statement", placeholder: "Paste your personal statement or essay draft. Even if it's rough — especially if it's rough..." },
    target: { title: "School / Program / Prompt", placeholder: "Paste the essay prompt and any context about the school or program you're applying to..." },
    cta: "Audit the Essay",
    color: "#06b6d4",
  },
};

function TextPanel({
  title,
  placeholder,
  value,
  onChange,
  focused,
  onFocus,
  onBlur,
  color,
}: {
  title: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  color: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: focused ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.018)",
        border: `1px solid ${focused ? color + "55" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 22,
        overflow: "hidden",
        transition: "all 0.25s ease",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 22px",
          borderBottom: `1px solid ${focused ? color + "25" : "rgba(255,255,255,0.05)"}`,
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.82rem" }}>{title}</span>
        {value.length > 0 && (
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: focused ? color : "#475569", letterSpacing: "0.08em" }}>
            {value.length.toLocaleString()} chars
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{
          flex: 1,
          width: "100%",
          resize: "none",
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#cbd5e1",
          fontSize: "0.83rem",
          lineHeight: 1.7,
          padding: "18px 22px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxSizing: "border-box",
          caretColor: color,
        }}
      />
    </div>
  );
}

function AuditPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const rawMode = params.get("mode") || "resume";
  const mode = rawMode in MODE_CONFIG ? rawMode : "resume";
  const config = MODE_CONFIG[mode as keyof typeof MODE_CONFIG];

  const [doc, setDoc] = useState("");
  const [target, setTarget] = useState("");
  const [docFocused, setDocFocused] = useState(false);
  const [targetFocused, setTargetFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const canSubmit = doc.trim().length > 30 && target.trim().length > 30;

  const handleSubmit = () => {
    if (!canSubmit) return;
    sessionStorage.setItem("frankly_doc", doc);
    sessionStorage.setItem("frankly_target", target);
    sessionStorage.setItem("frankly_mode", mode);
    router.push(`/processing?mode=${mode}`);
  };

  return (
    <main
      style={{
        height: "100vh",
        width: "100%",
        background: "radial-gradient(ellipse at top, #1e293b 0%, #0b0e14 65%, #050709 100%)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* NAV */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}
      >
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 10,
            padding: "8px 18px",
            color: "#94a3b8",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLButtonElement).style.color = "#f1f5f9";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back
        </button>

        {/* Logo center */}
        <h1 className="logo-signature" style={{ fontSize: "2.4rem", lineHeight: 1, margin: 0 }}>
          Frankly.
        </h1>

        {/* Mode badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: `${config.color}10`,
            border: `1px solid ${config.color}35`,
            borderRadius: 10,
            padding: "8px 16px",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: config.color,
              display: "inline-block",
              boxShadow: `0 0 7px ${config.color}`,
            }}
          />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: config.color, letterSpacing: "0.06em" }}>
            {config.label}
          </span>
        </div>
      </nav>

      {/* MAIN BODY */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "28px 40px 24px",
          gap: 20,
          minHeight: 0,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.45s ease",
        }}
      >
        {/* Tagline */}
        <p style={{ textAlign: "center", color: "#334155", fontSize: "0.78rem", margin: 0, flexShrink: 0 }}>
          Drop it in. We'll tell you the truth.
        </p>

        {/* TWO PANELS side by side */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            flex: 1,
            minHeight: 0,
          }}
        >
          <TextPanel
            title={config.doc.title}
            placeholder={config.doc.placeholder}
            value={doc}
            onChange={setDoc}
            focused={docFocused}
            onFocus={() => setDocFocused(true)}
            onBlur={() => setDocFocused(false)}
            color={config.color}
          />
          <TextPanel
            title={config.target.title}
            placeholder={config.target.placeholder}
            value={target}
            onChange={setTarget}
            focused={targetFocused}
            onFocus={() => setTargetFocused(true)}
            onBlur={() => setTargetFocused(false)}
            color={config.color}
          />
        </div>

        {/* SUBMIT ROW */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              background: canSubmit ? config.color : "rgba(255,255,255,0.05)",
              color: canSubmit ? "#fff" : "#2d3748",
              border: canSubmit ? "none" : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              padding: "13px 52px",
              fontSize: "0.9rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: canSubmit ? "pointer" : "not-allowed",
              transition: "all 0.25s ease",
              boxShadow: canSubmit ? `0 4px 24px ${config.color}50` : "none",
            }}
            onMouseEnter={(e) => {
              if (canSubmit) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px) scale(1.02)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(1)";
            }}
          >
            {config.cta} →
          </button>
          {!canSubmit && (
            <p style={{ color: "#1e3a4a", fontSize: "0.7rem", margin: 0 }}>
              Both fields need at least a few sentences.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AuditPage() {
  return (
    <Suspense>
      <AuditPageInner />
    </Suspense>
  );
}
