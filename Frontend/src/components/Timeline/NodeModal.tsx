import { useState } from "react";
import type { TimelineStep } from "../../types";

interface NodeModalProps {
  step: TimelineStep | null;
  onClose: () => void;
}

function parseIntoItems(text: string): string[] {
  return text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

export default function NodeModal({ step, onClose }: NodeModalProps) {
  if (!step) return null;

  const subtitle = (step.metadata?.subtitle as string) || step.description;
  const fullText = (step.metadata?.fullText as string) || step.description;
  const items = parseIntoItems(fullText);

  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (i: number) =>
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));

  const completedCount = Object.values(checked).filter(Boolean).length;

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
          width: "520px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
          background: "#111",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          padding: "32px",
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

        {/* Step number badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 10px",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "14px",
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "block",
            }}
          >
            Step {step.index + 1}
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "rgba(255,255,255,0.95)",
            margin: "0 0 10px 0",
            paddingRight: "24px",
            lineHeight: "1.4",
          }}
        >
          {step.title}
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.55)",
            lineHeight: "1.6",
            margin: "0 0 20px 0",
            fontStyle: "italic",
          }}
        >
          {subtitle}
        </p>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            marginBottom: "20px",
          }}
        />

        {/* Checklist header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Action Items
          </p>
          <p
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.2)",
              margin: 0,
              letterSpacing: "0.05em",
            }}
          >
            {completedCount} / {items.length}
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: "2px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "9999px",
            marginBottom: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${items.length ? (completedCount / items.length) * 100 : 0}%`,
              background: "rgba(255,255,255,0.4)",
              borderRadius: "9999px",
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {/* Checkbox items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {items.map((item, i) => (
            <div
              key={i}
              onClick={() => toggle(i)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
                padding: "10px 12px",
                borderRadius: "10px",
                background: checked[i]
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(255,255,255,0.02)",
                border: checked[i]
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(255,255,255,0.04)",
                transition: "all 0.2s",
              }}
            >
              {/* Custom checkbox */}
              <div
                style={{
                  flexShrink: 0,
                  marginTop: "2px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "4px",
                  border: checked[i]
                    ? "1px solid rgba(255,255,255,0.5)"
                    : "1px solid rgba(255,255,255,0.2)",
                  background: checked[i]
                    ? "rgba(255,255,255,0.15)"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                {checked[i] && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path
                      d="M1 3.5L3.5 6L8 1"
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Text */}
              <p
                style={{
                  fontSize: "13px",
                  color: checked[i]
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(255,255,255,0.7)",
                  lineHeight: "1.7",
                  margin: 0,
                  textDecoration: checked[i] ? "line-through" : "none",
                  transition: "all 0.2s",
                }}
              >
                {item}
              </p>
            </div>
          ))}
        </div>

        {step.duration && (
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.2)",
              marginTop: "20px",
              marginBottom: 0,
            }}
          >
            Estimated time: {step.duration}
          </p>
        )}
      </div>
    </>
  );
}