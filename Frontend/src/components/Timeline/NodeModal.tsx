import type { TimelineStep } from "../../types";

interface NodeModalProps {
  step: TimelineStep | null;
  onClose: () => void;
}

export default function NodeModal({ step, onClose }: NodeModalProps) {
  if (!step) return null;

  const subtitle = (step.metadata?.subtitle as string) || step.description;
  const fullText = (step.metadata?.fullText as string) || step.description;

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
            display: "inline-block",
            padding: "3px 10px",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "14px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
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

        {/* Subtitle — the concise sentence from Ollama */}
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

        {/* Full text — the detailed description from Ollama */}
        <div>
          <p
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              margin: "0 0 10px 0",
            }}
          >
            Details
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.7)",
              lineHeight: "1.8",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {fullText}
          </p>
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