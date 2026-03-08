import { useState, useRef } from "react";
import type { TimelineStep } from "../../types";
import { useAppStore } from "../../stores/useAppStore";
import { fetchTTS } from "../../services/api";
import StepBadge from "./modal/StepBadge";
import ActionChecklist from "./modal/ActionChecklist";
import BranchPrompt from "./modal/BranchPrompt";

interface NodeModalProps {
  step: TimelineStep | null;
  onClose: () => void;
}

export default function NodeModal({ step, onClose }: NodeModalProps) {
  const currentGoal = useAppStore((s) => s.currentGoal);
  const nav = useAppStore((s) => s.nav);
  const [ttsState, setTtsState] = useState<"idle" | "loading" | "playing">(
    "idle",
  );
  const [narrationText, setNarrationText] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!step) return null;

  const subtitle = step.subtitle || step.description;
  const fullText = step.fullText || step.description;

  const steps = currentGoal?.steps ?? [];
  const branches = currentGoal?.branches ?? [];
  const stepIdx = steps.findIndex((s) => s.id === step.id);
  const hasBranch = branches.some((b) => b.parentStepId === step.id);

  const handlePlayTTS = async () => {
    if (ttsState === "playing" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setTtsState("idle");
      return;
    }

    setTtsState("loading");

    const current = {
      id: step.id,
      index: step.index,
      title: step.title,
      subtitle: subtitle,
      fullText: fullText,
    };

    // Find previous step for narration context
    const prevStepIndex = nav.location.stepIndex - 1;
    let previous = null;
    if (prevStepIndex >= 0) {
      const stepsArray =
        nav.location.branchId === "main"
          ? steps
          : currentGoal?.branches.find((b) => b.id === nav.location.branchId)
              ?.steps ?? [];
      const prevStep = stepsArray[prevStepIndex];
      if (prevStep) {
        previous = {
          id: prevStep.id,
          index: prevStep.index,
          title: prevStep.title,
          subtitle: prevStep.subtitle || prevStep.description,
          fullText: prevStep.fullText || prevStep.description,
        };
      }
    }

    const result = await fetchTTS(current, previous);

    if (!result.success) {
      setTtsState("idle");
      return;
    }

    if (result.text) {
      setNarrationText(result.text);
    }

    // Play audio if available (ElevenLabs key present on backend)
    if (result.audio) {
      const url = URL.createObjectURL(result.audio);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setTtsState("idle");
        URL.revokeObjectURL(url);
      };

      audio.onerror = () => {
        setTtsState("idle");
        URL.revokeObjectURL(url);
      };

      audio.play();
      setTtsState("playing");
    } else {
      // No audio (no ElevenLabs key), but narration text was still generated
      setTtsState("idle");
    }
  };

  return (
    <>
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

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -54%)",
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
        {/* Close + Play buttons */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {/* TTS Play button */}
          <button
            onClick={handlePlayTTS}
            disabled={ttsState === "loading"}
            aria-label={
              ttsState === "playing" ? "Stop voiceover" : "Play voiceover"
            }
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                ttsState === "playing"
                  ? "rgba(103,232,249,0.15)"
                  : ttsState === "loading"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.06)",
              border:
                ttsState === "playing"
                  ? "1px solid rgba(103,232,249,0.3)"
                  : "1px solid rgba(255,255,255,0.1)",
              color:
                ttsState === "playing"
                  ? "#67e8f9"
                  : ttsState === "loading"
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(255,255,255,0.35)",
              cursor: ttsState === "loading" ? "wait" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {ttsState === "loading" ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                style={{ animation: "spin 1s linear infinite" }}
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="28"
                  strokeDashoffset="8"
                  strokeLinecap="round"
                />
              </svg>
            ) : ttsState === "playing" ? (
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="currentColor"
              >
                <rect x="1" y="1" width="8" height="8" rx="1" />
              </svg>
            ) : (
              <svg
                width="11"
                height="11"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M3 1.5v9l7.5-4.5L3 1.5z" />
              </svg>
            )}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
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
        </div>

        <BranchPrompt
          stepId={step.id}
          stepIndex={stepIdx}
          hasBranch={hasBranch}
          nodeTitle={step.title}
          nodeSubtitle={subtitle}
          nodeText={fullText}
        />

        <StepBadge index={step.index} />

        <h2
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "rgba(255,255,255,0.95)",
            margin: "0 0 10px 0",
            paddingRight: "60px",
            lineHeight: "1.4",
          }}
        >
          {step.title}
        </h2>

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

        <div
          style={{
            width: "100%",
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            marginBottom: "20px",
          }}
        />

        {/* Narration text (shown after TTS call) */}
        {narrationText && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              background: "rgba(103,232,249,0.04)",
              border: "1px solid rgba(103,232,249,0.1)",
              borderRadius: "12px",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                color: "rgba(103,232,249,0.5)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                margin: "0 0 8px 0",
                fontWeight: 600,
              }}
            >
              Narration
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.6)",
                lineHeight: "1.7",
                margin: 0,
              }}
            >
              {narrationText}
            </p>
          </div>
        )}

        <ActionChecklist text={fullText} />

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