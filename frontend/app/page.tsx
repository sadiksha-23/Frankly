"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const MODES = [
  {
    id: "resume",
    sub: "RAW DOCUMENT REVIEW",
    title: "Resume Audit",
    desc: "Deep analysis of keyword density, technical impact, and formatting integrity against the actual job description.",
    color: "#3b82f6",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "interview",
    sub: "POST-GAME ANALYSIS",
    title: "Interview Prep",
    desc: "Audit your conversation failures and build a precise strategic playbook before your next selection round.",
    color: "#8b5cf6",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "admissions",
    sub: "NARRATIVE DESIGN",
    title: "Academic Prep",
    desc: "Refine your personal statement for institutional fit, intellectual authenticity, and narrative clarity.",
    color: "#06b6d4",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
];

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <main style={{
      height: "100vh",
      width: "100%",
      background: "radial-gradient(ellipse at 50% 0%, #1a2744 0%, #0d1117 55%, #050709 100%)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Ambient glow blobs */}
      <div style={{
        position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 300,
        background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", left: "15%",
        width: 300, height: 300,
        background: "radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "10%",
        width: 280, height: 280,
        background: "radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* HERO TEXT */}
      <div style={{
        textAlign: "center",
        marginBottom: 56,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.55s ease",
      }}>
        <h1 className="logo-signature" style={{ fontSize: "7rem", lineHeight: 0.95, margin: "0 0 16px" }}>
          Frankly.
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1rem", fontWeight: 300, margin: "0 0 6px", letterSpacing: "0.02em" }}>
          Your Strategic Selection Blueprint.
        </p>
        <p style={{ color: "#334155", fontSize: "0.78rem", fontWeight: 400, margin: 0 }}>
          Precision-engineered audits for high-stakes applications.
        </p>
      </div>

      {/* CARDS */}
      <div style={{
        display: "flex",
        gap: 20,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease 0.1s",
      }}>
        {MODES.map((m) => {
          const isHovered = hovered === m.id;
          return (
            <div
              key={m.id}
              onClick={() => router.push(`/audit?mode=${m.id}`)}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: 300,
                background: isHovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isHovered ? m.color + "60" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 28,
                padding: "36px 28px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                boxShadow: isHovered ? `0 20px 60px ${m.color}20` : "none",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {/* Icon */}
              <div style={{
                width: 52, height: 52,
                borderRadius: 16,
                background: isHovered ? `${m.color}20` : "rgba(255,255,255,0.04)",
                border: `1px solid ${isHovered ? m.color + "40" : "rgba(255,255,255,0.06)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isHovered ? m.color : "#475569",
                marginBottom: 24,
                transition: "all 0.3s ease",
              }}>
                {m.icon}
              </div>

              {/* Sub label */}
              <p style={{
                fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.22em",
                color: isHovered ? m.color : "#334155",
                margin: "0 0 8px",
                transition: "color 0.3s",
              }}>
                {m.sub}
              </p>

              {/* Title */}
              <h3 style={{
                color: "#f1f5f9", fontSize: "1.25rem", fontWeight: 700,
                margin: "0 0 12px", lineHeight: 1.2,
              }}>
                {m.title}
              </h3>

              {/* Desc */}
              <p style={{
                color: "#475569", fontSize: "0.78rem", lineHeight: 1.65,
                margin: "0 0 28px", flex: 1,
              }}>
                {m.desc}
              </p>

              {/* CTA */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                color: isHovered ? m.color : "#334155",
                fontSize: "0.78rem", fontWeight: 700,
                transition: "color 0.3s",
              }}>
                <span>Start audit</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ transform: isHovered ? "translateX(3px)" : "translateX(0)", transition: "transform 0.25s ease" }}>
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p style={{
        position: "absolute", bottom: 24,
        color: "#1e293b", fontSize: "0.68rem", letterSpacing: "0.08em",
        opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease 0.3s",
      }}>
        FRANKLY · PRECISION AUDITS
      </p>
    </main>
  );
}
