"use client";
import { useState, useMemo } from "react";
import { PromptTemplate } from "@/lib/templates/types";
import { PromptEngine } from "@/lib/templates/engine";

interface Props {
  template: PromptTemplate;
  onClose: () => void;
}

const AI_COLORS: Record<string, { color: string; bg: string }> = {
  ChatGPT: { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  Claude: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Gemini: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  Perplexity: { color: "#14b8a6", bg: "rgba(20,184,166,0.1)" },
};

export default function PromptBuilder({ template, onClose }: Props) {
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    template.variables.forEach(v => {
      if (v.defaultValue) defaults[v.key] = v.defaultValue;
    });
    return defaults;
  });
  const [copied, setCopied] = useState(false);

  const preview = useMemo(() => PromptEngine.build(template, inputs), [template, inputs]);
  const score = useMemo(() => PromptEngine.calculateScore(template, inputs), [template, inputs]);
  const tokens = useMemo(() => PromptEngine.estimateTokens(preview), [preview]);

  const allFilled = template.variables
    .filter(v => v.required)
    .every(v => inputs[v.key]?.trim());

  const handleCopy = () => {
    navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenAI = (ai: string) => {
    const url = PromptEngine.generateAILink(ai, preview);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 640, maxHeight: "90vh",
          overflowY: "auto", borderRadius: 20,
          background: "#0d0d14",
          border: "1px solid rgba(99,102,241,0.25)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)"
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>{template.icon}</span>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#f0f0f4" }}>{template.title}</h2>
            </div>
            <p style={{ fontSize: 12, color: "#555" }}>{template.description}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "#444",
              fontSize: 20, cursor: "pointer", padding: "0 4px", lineHeight: 1
            }}
          >✕</button>
        </div>

        {/* Score bar */}
        <div style={{ padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 16 }}>
          <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>
            Score: <span style={{ color: score >= 8 ? "#4ade80" : score >= 5 ? "#facc15" : "#f87171", fontWeight: 700 }}>{score}/10</span>
          </span>
          <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>~{tokens} tokens</span>
          <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>⏱ {template.estimatedTime}</span>
        </div>

        {/* Variables form */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {template.variables.map(variable => (
            <div key={variable.key}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 700,
                color: "#a5b4fc", marginBottom: 6, letterSpacing: "0.03em"
              }}>
                {variable.label}
                {variable.required && <span style={{ color: "#f87171", marginLeft: 4 }}>*</span>}
              </label>

              {variable.helper && (
                <p style={{ fontSize: 11, color: "#444", marginBottom: 6 }}>{variable.helper}</p>
              )}

              {variable.type === "select" ? (
                <select
                  value={inputs[variable.key] || ""}
                  onChange={e => setInputs(prev => ({ ...prev, [variable.key]: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    color: inputs[variable.key] ? "#e2e2e8" : "#555", fontSize: 13,
                    fontFamily: "Sora, sans-serif", cursor: "pointer", outline: "none"
                  }}
                >
                  <option value="" disabled>Selecciona una opción...</option>
                  {variable.options?.map(opt => (
                    <option key={opt} value={opt} style={{ background: "#0d0d14" }}>{opt}</option>
                  ))}
                </select>

              ) : variable.type === "textarea" ? (
                <textarea
                  value={inputs[variable.key] || ""}
                  onChange={e => setInputs(prev => ({ ...prev, [variable.key]: e.target.value }))}
                  placeholder={variable.placeholder}
                  rows={3}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e2e2e8", fontSize: 13, fontFamily: "Sora, sans-serif",
                    resize: "vertical", outline: "none"
                  }}
                />

              ) : (
                <input
                  type="text"
                  value={inputs[variable.key] || ""}
                  onChange={e => setInputs(prev => ({ ...prev, [variable.key]: e.target.value }))}
                  placeholder={variable.placeholder}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e2e2e8", fontSize: 13, fontFamily: "Sora, sans-serif", outline: "none"
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Preview */}
        <div style={{ padding: "0 24px 20px" }}>
          <p style={{ fontSize: 11, color: "#444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Vista previa del prompt
          </p>
          <div style={{
            background: "rgba(0,0,0,0.4)", borderRadius: 12, padding: "14px 16px",
            border: "1px solid rgba(255,255,255,0.05)", minHeight: 80
          }}>
            <p style={{
              fontSize: 12, color: "#666", lineHeight: 1.7,
              fontFamily: "JetBrains Mono, monospace", whiteSpace: "pre-wrap"
            }}>
              {preview}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: "16px 24px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column", gap: 10
        }}>
          <button
            onClick={handleCopy}
            disabled={!allFilled}
            style={{
              width: "100%", padding: "13px",
              borderRadius: 12, fontSize: 14, fontWeight: 700, border: "none",
              background: allFilled
                ? copied
                  ? "linear-gradient(135deg,#4ade80,#22c55e)"
                  : "linear-gradient(135deg,#6366f1,#7c3aed)"
                : "rgba(255,255,255,0.05)",
              color: allFilled ? "#fff" : "#333",
              cursor: allFilled ? "pointer" : "not-allowed",
              transition: "all 0.2s"
            }}
          >
            {copied ? "✔ ¡Copiado!" : allFilled ? "Copiar prompt personalizado" : "Completa los campos requeridos (*)"}
          </button>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {template.recommendedAI.map(ai => {
              const c = AI_COLORS[ai] || { color: "#888", bg: "rgba(136,136,136,0.1)" };
              return (
                <button
                  key={ai}
                  onClick={() => handleOpenAI(ai)}
                  disabled={!allFilled}
                  style={{
                    flex: 1, minWidth: 100, padding: "9px 12px",
                    borderRadius: 10, fontSize: 12, fontWeight: 600,
                    border: `1px solid ${c.color}44`,
                    background: allFilled ? c.bg : "rgba(255,255,255,0.02)",
                    color: allFilled ? c.color : "#333",
                    cursor: allFilled ? "pointer" : "not-allowed"
                  }}
                >
                  Abrir en {ai} →
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}