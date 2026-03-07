import { useAppStore } from "../stores/useAppStore";
import { generateMockGoal, generateMockRefinement } from "../services/mockData";
import { v4 } from "../utils/uid";
import PromptInput from "../components/Dashboard/PromptInput";
import ChatMessages from "../components/Dashboard/ChatMessages";
import TimelinePreview from "../components/Timeline/TimelinePreview";

export default function DashboardPage() {
  const { phase, messages, addMessage, setPhase, setCurrentGoal } = useAppStore();

  const isTransitioning = phase === "transitioning";
  const titleInCenter = phase === "prompt" && messages.length === 0;
  const titleInTopLeft = isTransitioning || phase === "timeline";
  const inputAtBottom = isTransitioning || phase === "timeline";
  const showChat = messages.length > 0 && !isTransitioning && phase !== "timeline";

  const handleSubmit = async (text: string) => {
    addMessage({
      id: v4(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    });

    if (phase === "prompt") {
      setPhase("refining");
      const mockReply = generateMockRefinement(text);
      setTimeout(() => addMessage(mockReply), 600);
      setTimeout(() => {
        const goal = generateMockGoal(text);
        setCurrentGoal(goal);
        setPhase("transitioning");
        setTimeout(() => setPhase("timeline"), 1400);
      }, 2200);
    } else if (phase === "refining") {
      const mockReply = generateMockRefinement(text);
      setTimeout(() => addMessage(mockReply), 500);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <TimelinePreview visible={phase === "prompt" || phase === "refining"} />

      {/* Title */}
      <div
        className="absolute z-20 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          ...(titleInCenter
            ? {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -100px)",
              }
            : titleInTopLeft
            ? {
                top: "1.5rem",
                left: "2rem",
              }
            : {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -100px)",
              }),
        }}
      >
        <h1
          className="font-title text-white leading-none tracking-wider transition-all duration-[1200ms]"
          style={{
            fontSize: titleInCenter ? "3.5rem" : titleInTopLeft ? "1.5rem" : "3rem",
          }}
        >
          RIPPLE
        </h1>
        {titleInCenter && (
          <p
            className="font-body mt-4 text-center animate-fade-in tracking-wide"
            style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.35)" }}
          >
            Where your goals come to life.
          </p>
        )}
      </div>

      {/* Chat + Input */}
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
          gap: "1rem",
          ...(inputAtBottom
            ? { bottom: "1.5rem" }
            : titleInCenter
            ? { top: "50%", marginTop: "20px" }
            : { top: "50%", marginTop: "-25%" }),
        }}
      >
        {showChat && <ChatMessages messages={messages} />}
        <PromptInput
          onSubmit={handleSubmit}
          disabled={isTransitioning}
          compact={inputAtBottom}
          placeholder={
            phase === "refining"
              ? "Add more detail or say 'looks good'…"
              : "What goal do you want to achieve?"
          }
        />
      </div>
    </div>
  );
}