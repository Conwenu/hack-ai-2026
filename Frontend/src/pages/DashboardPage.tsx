import { useState } from "react";
import { useAppStore } from "../stores/useAppStore";
import { submitGoal } from "../services/api";
import { v4 } from "../utils/uid";
import PromptInput from "../components/Dashboard/PromptInput";
import TimelinePreview from "../components/Timeline/TimelinePreview";
import CursorRipple from "../components/Dashboard/CursorRipple";

export default function DashboardPage() {
  const { phase, addMessage, setPhase, setCurrentGoal } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTransitioning = phase === "transitioning";
  const isInitial = phase === "prompt";

  const handleSubmit = async (text: string) => {
    addMessage({
      id: v4(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    });

    setLoading(true);
    setError(null);
    setPhase("refining");

    try {
      const result = await submitGoal(text);

      if (!result.success || !result.data) {
        setError(result.error || "Failed to generate plan. Is your backend running?");
        setPhase("prompt");
        setLoading(false);
        return;
      }

      setCurrentGoal(result.data);
      setPhase("transitioning");
      setTimeout(() => setPhase("timeline"), 2400);
    } catch (err) {
      setError((err as Error).message);
      setPhase("prompt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {isInitial && <CursorRipple />}
      {!isTransitioning && phase !== "refining" && (
        <TimelinePreview visible={true} />
      )}

      {/* TITLE */}
      <div
        style={{
          position: "absolute",
          zIndex: 30,
          transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
          ...(isTransitioning
            ? { top: "1.5rem", left: "2rem", transform: "translate(0, 0)" }
            : { top: "50%", left: "50%", transform: "translate(-50%, -100px)" }
          ),
        }}
      >
        <h1
          className="font-title text-white leading-none tracking-wider"
          style={{
            transition: "font-size 1s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: isTransitioning ? "1.5rem" : "3.5rem",
          }}
        >
          RIPPLE
        </h1>
        {isInitial && (
          <p
            className="font-body mt-4 text-center animate-fade-in tracking-wide"
            style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.35)" }}
          >
            Where your goals come to life.
          </p>
        )}
      </div>

      {/* INPUT */}
      {isInitial && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            width: "55%",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            top: "50%",
            marginTop: "20px",
          }}
        >
          <PromptInput
            onSubmit={handleSubmit}
            disabled={loading}
            compact={false}
            placeholder="What goal do you want to achieve?"
          />
          {error && (
            <p
              style={{
                marginTop: "16px",
                fontSize: "13px",
                color: "#ff6b6b",
                textAlign: "center",
                maxWidth: "400px",
                lineHeight: "1.5",
              }}
            >
              {error}
            </p>
          )}
        </div>
      )}

      {/* GENERATING STATE */}
      {phase === "refining" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <div style={{ position: "relative", width: "160px", height: "160px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `${i === 0 ? "2px" : "1.5px"} solid rgba(255,255,255,${0.65 - i * 0.18})`,
                  boxShadow: `0 0 ${10 + i * 6}px rgba(255,255,255,${0.12 - i * 0.03})`,
                  animation: `ripple-expand 2.4s ease-out ${i * 0.5}s infinite`,
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 0 14px rgba(255,255,255,0.6), 0 0 28px rgba(255,255,255,0.2)",
                animation: "subtle-pulse 1.2s ease-in-out infinite",
              }}
            />
          </div>
          <span
            style={{
              marginTop: "28px",
              fontSize: "13px",
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Thinking
          </span>
          <p
            style={{
              marginTop: "8px",
              fontSize: "11px",
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.05em",
            }}
          >
            Generating your plan…
          </p>
        </div>
      )}

      {/* MAPPING ANIMATION */}
      {isTransitioning && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <div style={{ position: "relative", width: "160px", height: "160px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `${i === 0 ? "2px" : "1.5px"} solid rgba(255,255,255,${0.7 - i * 0.2})`,
                  boxShadow: `0 0 ${10 + i * 6}px rgba(255,255,255,${0.12 - i * 0.03})`,
                  animation: `ripple-expand 1.8s ease-out ${i * 0.35}s infinite`,
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 0 14px rgba(255,255,255,0.6), 0 0 28px rgba(255,255,255,0.2)",
                animation: "subtle-pulse 1s ease-in-out infinite",
              }}
            />
          </div>
          <span
            style={{
              marginTop: "28px",
              fontSize: "13px",
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Mapping
          </span>
        </div>
      )}
    </div>
  );
}