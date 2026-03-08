import { useAppStore } from "../stores/useAppStore";
import { generateMockGoal } from "../services/mockData";
import { v4 } from "../utils/uid";
import PromptInput from "../components/Dashboard/PromptInput";
import TimelinePreview from "../components/Timeline/TimelinePreview";

export default function DashboardPage() {
  const { phase, addMessage, setPhase, setCurrentGoal } = useAppStore();

  const isTransitioning = phase === "transitioning";
  const isInitial = phase === "prompt";

  const handleSubmit = async (text: string) => {
    addMessage({
      id: v4(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    });

    // Skip refining — go straight to transition
    const goal = generateMockGoal(text);
    setCurrentGoal(goal);
    setPhase("transitioning");
    setTimeout(() => setPhase("timeline"), 2400);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {!isTransitioning && (
        <TimelinePreview visible={true} />
      )}

      {/* TITLE — animates from center to top-left */}
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

      {/* INPUT — only on initial prompt screen, gone during transition */}
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
            disabled={false}
            compact={false}
            placeholder="What goal do you want to achieve?"
          />
        </div>
      )}

      {/* MAPPING ANIMATION — during transition, while title slides to top-left */}
      {isTransitioning && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <div style={{ position: "relative", width: "128px", height: "128px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.2)",
                  animation: `ripple-expand 1.8s ease-out ${i * 0.3}s infinite`,
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Mapping
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}