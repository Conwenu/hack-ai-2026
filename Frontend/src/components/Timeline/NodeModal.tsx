import type { TimelineStep } from "../../types";
import { useAppStore } from "../../stores/useAppStore";
import StepBadge from "./modal/StepBadge";
import ActionChecklist from "./modal/ActionChecklist";
import BranchPrompt from "./modal/BranchPrompt";

interface NodeModalProps {
  step: TimelineStep | null;
  onClose: () => void;
}

export default function NodeModal({ step, onClose }: NodeModalProps) {
  const currentGoal = useAppStore((s) => s.currentGoal);

  if (!step) return null;

  const subtitle = (step.metadata?.subtitle as string) || step.description;
  const fullText = (step.metadata?.fullText as string) || step.description;

  const steps = currentGoal?.steps ?? [];
  const branches = currentGoal?.branches ?? [];
  const stepIdx = steps.findIndex((s) => s.id === step.id);
  const hasBranch = branches.some((b) => b.parentStepId === step.id);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 50 }} />

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
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}>
          ✕
        </button>

        <BranchPrompt
          stepId={step.id}
          stepIndex={stepIdx}
          hasBranch={hasBranch}
        />

        <StepBadge index={step.index} />

        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "rgba(255,255,255,0.95)", margin: "0 0 10px 0", paddingRight: "24px", lineHeight: "1.4" }}>
          {step.title}
        </h2>

        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: "1.6", margin: "0 0 20px 0", fontStyle: "italic" }}>
          {subtitle}
        </p>

        <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "20px" }} />

        <ActionChecklist text={fullText} />

        {step.duration && (
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "20px", marginBottom: 0 }}>
            Estimated time: {step.duration}
          </p>
        )}
      </div>
    </>
  );
}