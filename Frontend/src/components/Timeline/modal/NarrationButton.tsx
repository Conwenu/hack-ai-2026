import { useState, useRef } from "react";
import type { TimelineStep } from "../../../types";
import { useAppStore } from "../../../stores/useAppStore";
import { fetchTTS } from "../../../services/api";

interface NarrationButtonProps {
  step: TimelineStep;
  subtitle: string;
  fullText: string;
}

function Waveform() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px", height: "12px" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            width: "2px",
            borderRadius: "1px",
            background: "#67e8f9",
            animation: `waveform 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes waveform {
          0% { height: 3px; opacity: 0.4; }
          100% { height: 12px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function NarrationButton({ step, subtitle, fullText }: NarrationButtonProps) {
  const currentGoal = useAppStore((s) => s.currentGoal);
  const nav = useAppStore((s) => s.nav);
  const [ttsState, setTtsState] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const steps = currentGoal?.steps ?? [];

  const handleClick = async () => {
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
      subtitle,
      fullText,
    };

    const prevStepIndex = nav.location.stepIndex - 1;
    let previous = null;
    if (prevStepIndex >= 0) {
      const stepsArray =
        nav.location.branchId === "main"
          ? steps
          : currentGoal?.branches.find((b) => b.id === nav.location.branchId)?.steps ?? [];
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

    if (result.audio) {
      const url = URL.createObjectURL(result.audio);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setTtsState("idle"); URL.revokeObjectURL(url); };
      audio.onerror = () => { setTtsState("idle"); URL.revokeObjectURL(url); };
      audio.play();
      setTtsState("playing");
    } else {
      setTtsState("idle");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={ttsState === "loading"}
      title={ttsState === "playing" ? "Stop narration" : "Play narration"}
      style={{
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          ttsState === "playing"
            ? "rgba(103,232,249,0.12)"
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
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 1s linear infinite" }}>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round" />
        </svg>
      ) : ttsState === "playing" ? (
        <Waveform />
      ) : (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
          <path d="M3 1.5v9l7.5-4.5L3 1.5z" />
        </svg>
      )}
    </button>
  );
}