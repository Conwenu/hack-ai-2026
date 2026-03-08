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
  onCreated: () => void;
}

export default function BranchPrompt({
  stepId,
  stepIndex,
  hasBranch,
  nodeTitle,
  nodeSubtitle,
  nodeText,
  onCreated,
}: BranchPromptProps) {
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addBranch = useAppStore((s) => s.addBranch);

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
    setCreating(false);
    onCreated();
  };

  return (
    <div
      style={{
        marginBottom: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        background: "rgba(167,139,250,0.04)",
        border: "1px solid rgba(167,139,250,0.15)",
        borderRadius: "12px",
        padding: "14px",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          color: "rgba(167,139,250,0.7)",
          letterSpacing: "0.1em",
          margin: 0,
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        Branch Goal
      </p>
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
          background:
            prompt.trim() && !creating
              ? "rgba(167,139,250,0.2)"
              : "transparent",
          border: "1px solid rgba(167,139,250,0.25)",
          color:
            prompt.trim() && !creating
              ? "rgba(167,139,250,0.95)"
              : "rgba(255,255,255,0.2)",
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
        <p
          style={{
            fontSize: "11px",
            color: "#ff6b6b",
            margin: "4px 0 0 0",
            lineHeight: "1.4",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}