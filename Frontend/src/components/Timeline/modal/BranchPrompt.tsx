import { useState } from "react";
import { useAppStore } from "../../../stores/useAppStore";
import { generateBranch } from "../../../services/api";
import { v4 } from "../../../utils/uid";
import type { Branch } from "../../../types";

interface BranchPromptProps {
  stepId: string;
  stepIndex: number;
  hasBranch: boolean;
  nodeTitle: string;
  nodeSubtitle: string;
  nodeText: string;
}

export default function BranchPrompt({ stepId, stepIndex, hasBranch, nodeTitle, nodeSubtitle, nodeText }: BranchPromptProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addBranch = useAppStore((s) => s.addBranch);

  if (hasBranch) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
        <div style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: "rgba(167,139,250,0.6)",
        }} />
        <span style={{
          fontSize: "10px", color: "rgba(167,139,250,0.5)",
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          Branched
        </span>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setCreating(true);
    setError(null);

    const result = await generateBranch(
      prompt.trim(),
      nodeTitle,
      nodeSubtitle,
      nodeText,
    );

    if (!result.success || !result.data) {
      setError(result.error || "Failed to generate branch. Is the backend running?");
      setCreating(false);
      return;
    }

    const branchSteps = result.data.steps.map((s, i) => ({
      id: s.id,
      index: i,
      title: s.title,
      description: s.subtitle,
      subtitle: s.subtitle,
      fullText: s.text,
      duration: undefined,
      status: "pending" as const,
    }));

    const branch: Branch = {
      id: v4(),
      parentStepId: stepId,
      label: prompt.trim(),
      steps: branchSteps,
    };

    addBranch(branch);
    setPrompt("");
    setOpen(false);
    setCreating(false);
  };

  return (
    <div style={{ marginBottom: "8px" }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(167,139,250,0.06)",
            border: "1px solid rgba(167,139,250,0.15)",
            borderRadius: "10px",
            padding: "8px 14px",
            color: "rgba(167,139,250,0.7)",
            fontSize: "11px",
            letterSpacing: "0.06em",
            cursor: "pointer",
            transition: "all 0.25s",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)";
            e.currentTarget.style.color = "rgba(167,139,250,0.95)";
            e.currentTarget.style.background = "rgba(167,139,250,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(167,139,250,0.15)";
            e.currentTarget.style.color = "rgba(167,139,250,0.7)";
            e.currentTarget.style.background = "rgba(167,139,250,0.06)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3v5a3 3 0 003 3h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M9 9l2 2-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="3" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span style={{ fontWeight: 500 }}>Branch from this step</span>
          <span style={{
            marginLeft: "auto",
            fontSize: "9px",
            color: "rgba(167,139,250,0.35)",
            letterSpacing: "0.1em",
          }}>
            SPLIT INTO SUB-GOALS
          </span>
        </button>
      ) : (
        <div style={{
          display: "flex", flexDirection: "column", gap: "10px",
          background: "rgba(167,139,250,0.04)",
          border: "1px solid rgba(167,139,250,0.15)",
          borderRadius: "12px",
          padding: "14px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "10px", color: "rgba(167,139,250,0.7)", letterSpacing: "0.1em", margin: 0, textTransform: "uppercase", fontWeight: 600 }}>
              Branch Goal
            </p>
            <button
              onClick={() => { setOpen(false); setPrompt(""); setError(null); }}
              style={{
                background: "transparent", border: "none",
                color: "rgba(255,255,255,0.25)", fontSize: "14px",
                cursor: "pointer", lineHeight: 1, padding: "2px 4px",
              }}
            >
              ✕
            </button>
          </div>
          <textarea
            autoFocus
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What sub-goal do you want to explore from here?"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            style={{
              width: "100%",
              minHeight: "60px",
              background: "rgba(167,139,250,0.05)",
              border: "1px solid rgba(167,139,250,0.15)",
              borderRadius: "10px",
              padding: "10px 14px",
              color: "rgba(255,255,255,0.85)",
              fontSize: "13px",
              lineHeight: "1.6",
              resize: "none",
              outline: "none",
              fontFamily: "Saira, sans-serif",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || creating}
            style={{
              padding: "9px",
              borderRadius: "9999px",
              background: prompt.trim() && !creating ? "rgba(167,139,250,0.2)" : "transparent",
              border: "1px solid rgba(167,139,250,0.25)",
              color: prompt.trim() && !creating ? "rgba(167,139,250,0.95)" : "rgba(255,255,255,0.2)",
              fontSize: "12px",
              fontWeight: 500,
              cursor: prompt.trim() && !creating ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              letterSpacing: "0.04em",
            }}
          >
            {creating ? "Creating branch…" : "Create Branch"}
          </button>
          {error && (
            <p style={{
              fontSize: "11px",
              color: "#ff6b6b",
              margin: "4px 0 0 0",
              lineHeight: "1.4",
            }}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}