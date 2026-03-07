import { useAppStore } from "../../stores/useAppStore";

export default function TimelineHUD() {
  const { currentGoal, nav } = useAppStore();
  const step = currentGoal?.steps[nav.currentStepIndex];

  if (!step) return null;

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
        <p
          className="font-title"
          style={{ fontSize: "1.3rem", color: "rgba(255,255,255,0.9)", letterSpacing: "0.05em", margin: 0 }}
        >
          RIPPLE
        </p>
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
          padding: "0 2rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            width: "55%",
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
      </div>
    </div>
  );
}