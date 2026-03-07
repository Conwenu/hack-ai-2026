// ============================================================
// Ripple – Dashboard Page
// ============================================================

import { useAppStore } from "../stores/useAppStore";
import { generateMockGoal, generateMockRefinement } from "../services/mockData";
import { v4 } from "../utils/uid";
import PromptInput from "../components/Dashboard/PromptInput";
import ChatMessages from "../components/Dashboard/ChatMessages";

export default function DashboardPage() {
  const { phase, messages, addMessage, setPhase, setCurrentGoal } =
    useAppStore();

  const isRefining = phase === "refining";

  const handleSubmit = async (text: string) => {
    // Record the user message
    addMessage({
      id: v4(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    });

    if (phase === "prompt") {
      // First submission — kick off refinement.
      setPhase("refining");

      // -------------------------------------------------------
      // TODO (backend): Replace mock with `submitGoal(text)`
      // from services/api.ts once the backend is live.
      // -------------------------------------------------------
      const mockReply = generateMockRefinement(text);
      addMessage(mockReply);

      // Simulate the AI deciding the goal is ready after one exchange.
      // In production, the backend loop continues until it's satisfied.
      setTimeout(() => {
        const goal = generateMockGoal(text);
        setCurrentGoal(goal);
        setPhase("transitioning");

        // After the transition animation plays, switch to timeline.
        setTimeout(() => setPhase("timeline"), 1400);
      }, 1800);
    } else if (isRefining) {
      // Additional refinement messages
      // TODO (backend): call refineGoal(goalId, text)
      const mockReply = generateMockRefinement(text);
      addMessage(mockReply);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
      {/* Title — only shows on first prompt phase */}
      {phase === "prompt" && messages.length === 0 && (
        <div className="mb-10 text-center animate-fade-in">
          <h1 className="text-4xl font-light tracking-tight text-white/90 mb-2">
            ripple
          </h1>
          <p className="text-sm text-white/30">
            Describe a goal. We'll map the path.
          </p>
        </div>
      )}

      {/* Chat history */}
      <ChatMessages messages={messages} />

      {/* Input */}
      <PromptInput
        onSubmit={handleSubmit}
        disabled={phase === "transitioning"}
        placeholder={
          isRefining
            ? "Add more detail or say 'looks good'..."
            : "What goal do you want to achieve?"
        }
      />
    </div>
  );
}
