import { useState, useEffect } from "react";
import type { TimelineStep } from "../../types";

interface NodeModalProps {
  step: TimelineStep | null;
  onClose: () => void;
}

// For demo purposes we generate mock actionable steps from the description.
// When backend is ready, these will come from step.actionableItems
function getMockActions(step: TimelineStep): string[] {
  return [
    `Research approaches for: ${step.title}`,
    `Create a concrete plan with deadlines`,
    `Identify resources and dependencies`,
    `Execute first action item`,
    `Review and adjust based on results`,
  ];
}

export default function NodeModal({ step, onClose }: NodeModalProps) {
  const [checked, setChecked] = useState<boolean[]>([]);

  useEffect(() => {
    if (step) {
      setChecked(getMockActions(step).map(() => false));
    }
  }, [step?.id]);

  if (!step) return null;

  const actions = getMockActions(step);
  const completedCount = checked.filter(Boolean).length;
  const progress = actions.length > 0 ? (completedCount / actions.length) * 100 : 0;

  const toggle = (i: number) => {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 50,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "480px",
          maxWidth: "90vw",
          background: "#111",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          padding: "28px",
          zIndex: 51,
          boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            fontSize: "18px",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Title */}
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "rgba(255,255,255,0.95)",
            margin: "0 0 8px 0",
            paddingRight: "24px",
          }}
        >
          {step.title}
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.4)",
            lineHeight: "1.6",
            margin: "0 0 20px 0",
          }}
        >
          {step.description}
        </p>

        {step.duration && (
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", margin: "0 0 20px 0" }}>
            Estimated time: {step.duration}
          </p>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
              Progress
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
              {completedCount} / {actions.length}
            </p>
          </div>
          <div
            style={{
              width: "100%",
              height: "4px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "9999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "white",
                borderRadius: "9999px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Actionable steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {actions.map((action, i) => (
            <div
              key={i}
              onClick={() => toggle(i)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
                padding: "8px 10px",
                borderRadius: "10px",
                background: checked[i] ? "rgba(255,255,255,0.04)" : "transparent",
                transition: "background 0.2s",
              }}
            >
              {/* Checkbox */}
              <div
                style={{
                  flexShrink: 0,
                  width: "16px",
                  height: "16px",
                  borderRadius: "4px",
                  border: checked[i] ? "none" : "1px solid rgba(255,255,255,0.2)",
                  background: checked[i] ? "white" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "1px",
                  transition: "all 0.2s",
                }}
              >
                {checked[i] && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              <p
                style={{
                  fontSize: "13px",
                  color: checked[i] ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.75)",
                  margin: 0,
                  lineHeight: "1.5",
                  textDecoration: checked[i] ? "line-through" : "none",
                  transition: "all 0.2s",
                }}
              >
                {action}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}