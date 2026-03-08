import { useEffect, useState } from "react";
import { useAppStore } from "../../stores/useAppStore";

export default function TimelineHUD() {
  const { currentGoal, nav, nextStep, prevStep } = useAppStore();
  const step = currentGoal?.steps[nav.currentStepIndex];
  const [activeBtn, setActiveBtn] = useState<"prev" | "next" | null>(null);

  const flash = (btn: "prev" | "next") => {
    setActiveBtn(btn);
    setTimeout(() => setActiveBtn(null), 200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        prevStep();
        flash("prev");
      }
      if (e.key === "ArrowUp") {
        nextStep();
        flash("next");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextStep, prevStep]);

  if (!step) return null;

  const btnBase = {
    flexShrink: 0,
    padding: "6px 16px",
    borderRadius: "9999px",
    fontSize: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    transition: "all 0.2s",
  };

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>

      {/* ══ Top bar ══ */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <p
            className="font-title"
            style={{ fontSize: "1.3rem", color: "rgba(255,255,255,0.9)", letterSpacing: "0.05em", margin: 0 }}
          >
            RIPPLE
          </p>

          {/* ── Refocus button ── */}
          <button
            onClick={() => window.dispatchEvent(new Event("timeline-refocus"))}
            style={{
              pointerEvents: "auto",
              padding: "5px 12px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.5)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              transition: "all 0.2s",
              letterSpacing: "0.03em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.9)";
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            ⟐ Refocus
          </button>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em", margin: 0 }}>
            STEP
          </p>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", fontWeight: 300, margin: 0 }}>
            {nav.currentStepIndex + 1}
            <span style={{ color: "rgba(255,255,255,0.2)" }}> / {nav.totalSteps}</span>
          </p>
        </div>
      </div>

      {/* ══ Left panel: node list ══ */}
      <div
        style={{
          position: "absolute",
          top: "64px",
          bottom: "90px",
          left: "2rem",
          width: "180px",
          overflowY: "auto",
          scrollbarWidth: "none",
          pointerEvents: "auto",
          paddingTop: "1.5rem",
          paddingBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {currentGoal?.steps.map((s, i) => (
            <div
              key={s.id}
              onClick={() => useAppStore.getState().goToStep(i)}
              style={{
                padding: "7px 10px",
                borderRadius: "8px",
                background: i === nav.currentStepIndex ? "rgba(255,255,255,0.07)" : "transparent",
                border: i === nav.currentStepIndex ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  color: i === nav.currentStepIndex ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.28)",
                  fontWeight: i === nav.currentStepIndex ? 600 : 400,
                  lineHeight: "1.5",
                  margin: 0,
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {i + 1}. {s.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Bottom bar ══ */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "90px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          padding: "0 2rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={() => { prevStep(); flash("prev"); }}
          disabled={nav.currentStepIndex === 0}
          style={{
            ...btnBase,
            color: "rgba(255,255,255,0.4)",
            background: activeBtn === "prev" ? "rgba(255,255,255,0.15)" : "transparent",
            cursor: nav.currentStepIndex === 0 ? "not-allowed" : "pointer",
            opacity: nav.currentStepIndex === 0 ? 0.2 : 1,
          }}
        >
          ← Prev
        </button>

        <div
          style={{
            flex: 1,
            maxWidth: "55%",
            padding: "10px 20px",
            borderRadius: "9999px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "#1a1a1a",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.85)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {step.title}
          </p>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: "3px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {step.description}
          </p>
        </div>

        <button
          onClick={() => { nextStep(); flash("next"); }}
          disabled={nav.currentStepIndex === nav.totalSteps - 1}
          style={{
            ...btnBase,
            color: "rgba(255,255,255,0.4)",
            background: activeBtn === "next" ? "rgba(255,255,255,0.15)" : "transparent",
            cursor: nav.currentStepIndex === nav.totalSteps - 1 ? "not-allowed" : "pointer",
            opacity: nav.currentStepIndex === nav.totalSteps - 1 ? 0.2 : 1,
          }}
        >
          Next →
        </button>
      </div>

    </div>
  );
}