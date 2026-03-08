import { useEffect, useState } from "react";
import { useAppStore } from "../../stores/useAppStore";

export default function TimelineHUD() {
  const { currentGoal, nav, moveUp, moveDown, moveLeft, moveRight, navigateTo } =
    useAppStore();

  const { context, location } = nav;
  const step = context.current;

  const [activeBtn, setActiveBtn] = useState<"up" | "down" | "left" | "right" | null>(null);

  const flash = (btn: "up" | "down" | "left" | "right") => {
    setActiveBtn(btn);
    setTimeout(() => setActiveBtn(null), 200);
  };

  // Can we move in each direction?
  const stepsArray =
    location.branchId === "main"
      ? currentGoal?.steps ?? []
      : currentGoal?.branches.find((b) => b.id === location.branchId)?.steps ??
        [];

  const canUp = location.stepIndex > 0 || location.branchId !== "main";
  const canDown = location.stepIndex < stepsArray.length - 1;
  const canLeft = context.siblings.length > 0;
  const canRight = context.siblings.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useAppStore.getState();
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          store.moveDown();
          flash("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          store.moveUp();
          flash("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          store.moveLeft();
          flash("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          store.moveRight();
          flash("right");
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!step) return null;

  const btnBase: React.CSSProperties = {
    flexShrink: 0,
    padding: "6px 14px",
    borderRadius: "9999px",
    fontSize: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    transition: "all 0.2s",
    background: "transparent",
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  const disabledStyle: React.CSSProperties = {
    cursor: "not-allowed",
    opacity: 0.2,
  };

  // Label for current location
  const locationLabel =
    location.branchId === "main"
      ? `Step ${location.stepIndex + 1} / ${currentGoal?.steps.length ?? 0}`
      : (() => {
          const branch = currentGoal?.branches.find(
            (b) => b.id === location.branchId
          );
          return branch
            ? `Branch: ${branch.label} · ${location.stepIndex + 1} / ${branch.steps.length}`
            : `Branch · ${location.stepIndex + 1}`;
        })();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
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
            style={{
              fontSize: "1.3rem",
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.05em",
              margin: 0,
            }}
          >
            RIPPLE
          </p>

          <button
            onClick={() =>
              window.dispatchEvent(new Event("timeline-refocus"))
            }
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
          <p
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.28)",
              letterSpacing: "0.1em",
              margin: 0,
            }}
          >
            {location.branchId === "main" ? "MAIN" : "BRANCH"}
          </p>
          <p
            style={{
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.55)",
              fontWeight: 300,
              margin: 0,
            }}
          >
            {locationLabel}
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
        <div
          style={{ display: "flex", flexDirection: "column", gap: "6px" }}
        >
          {currentGoal?.steps.map((s, i) => {
            const isActive =
              location.branchId === "main" && i === location.stepIndex;
            const hasBranches = currentGoal.branches.some(
              (b) => b.parentStepId === s.id
            );
            return (
              <div key={s.id}>
                <div
                  onClick={() => navigateTo({ branchId: "main", stepIndex: i })}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "8px",
                    background: isActive
                      ? "rgba(255,255,255,0.07)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      color: isActive
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(255,255,255,0.28)",
                      fontWeight: isActive ? 600 : 400,
                      lineHeight: "1.5",
                      margin: 0,
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {i + 1}. {s.title}
                    {hasBranches && (
                      <span
                        style={{
                          marginLeft: "6px",
                          color: "rgba(103,232,249,0.5)",
                          fontSize: "8px",
                        }}
                      >
                        ⑂
                      </span>
                    )}
                  </p>
                </div>

                {/* Nested branch entries */}
                {currentGoal.branches
                  .filter((b) => b.parentStepId === s.id)
                  .map((branch) => (
                    <div
                      key={branch.id}
                      style={{ paddingLeft: "12px", marginTop: "2px" }}
                    >
                      <p
                        style={{
                          fontSize: "9px",
                          color: "rgba(103,232,249,0.35)",
                          margin: "4px 0 2px 0",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        ⑂ {branch.label}
                      </p>
                      {branch.steps.map((bs, bi) => {
                        const isBranchActive =
                          location.branchId === branch.id &&
                          bi === location.stepIndex;
                        return (
                          <div
                            key={bs.id}
                            onClick={() =>
                              navigateTo({
                                branchId: branch.id,
                                stepIndex: bi,
                              })
                            }
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              background: isBranchActive
                                ? "rgba(103,232,249,0.08)"
                                : "transparent",
                              border: isBranchActive
                                ? "1px solid rgba(103,232,249,0.15)"
                                : "1px solid transparent",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "9px",
                                color: isBranchActive
                                  ? "rgba(103,232,249,0.85)"
                                  : "rgba(255,255,255,0.2)",
                                fontWeight: isBranchActive ? 600 : 400,
                                margin: 0,
                                lineHeight: "1.5",
                                wordBreak: "break-word",
                              }}
                            >
                              {bs.title}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ Bottom bar — directional nav ══ */}
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
          gap: "10px",
          padding: "0 2rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
          pointerEvents: "auto",
        }}
      >
        {/* Left */}
        <button
          onClick={() => {
            moveLeft();
            flash("left");
          }}
          disabled={!canLeft}
          style={{
            ...btnBase,
            ...(activeBtn === "left"
              ? { background: "rgba(255,255,255,0.15)" }
              : {}),
            ...(!canLeft ? disabledStyle : {}),
          }}
          title="Left arrow — switch to sibling branch"
        >
          ←
        </button>

        {/* Up — goes deeper into timeline */}
        <button
          onClick={() => {
            moveDown();
            flash("up");
          }}
          disabled={!canDown}
          style={{
            ...btnBase,
            ...(activeBtn === "up"
              ? { background: "rgba(255,255,255,0.15)" }
              : {}),
            ...(!canDown ? disabledStyle : {}),
          }}
          title="Up arrow — next step"
        >
          ↑
        </button>

        {/* Center info pill */}
        <div
          style={{
            flex: 1,
            maxWidth: "45%",
            padding: "10px 20px",
            borderRadius: "9999px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "#1a1a1a",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {step.title}
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.35)",
              margin: "3px 0 0 0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {step.description}
          </p>
        </div>

        {/* Down — goes back toward start */}
        <button
          onClick={() => {
            moveUp();
            flash("down");
          }}
          disabled={!canUp}
          style={{
            ...btnBase,
            ...(activeBtn === "down"
              ? { background: "rgba(255,255,255,0.15)" }
              : {}),
            ...(!canUp ? disabledStyle : {}),
          }}
          title="Down arrow — previous step"
        >
          ↓
        </button>

        {/* Right */}
        <button
          onClick={() => {
            moveRight();
            flash("right");
          }}
          disabled={!canRight}
          style={{
            ...btnBase,
            ...(activeBtn === "right"
              ? { background: "rgba(255,255,255,0.15)" }
              : {}),
            ...(!canRight ? disabledStyle : {}),
          }}
          title="Right arrow — switch to sibling branch"
        >
          →
        </button>
      </div>
    </div>
  );
}