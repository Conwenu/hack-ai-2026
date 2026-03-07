// ============================================================
// Ripple – App Root
// ============================================================

import { useAppStore } from "./stores/useAppStore";
import DashboardPage from "./pages/DashboardPage";
import TimelinePage from "./pages/TimelinePage";
import PhaseTransition from "./components/Layout/PhaseTransition";

export default function App() {
  const phase = useAppStore((s) => s.phase);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Phase-based rendering */}
      {(phase === "prompt" || phase === "refining" || phase === "transitioning") && (
        <DashboardPage />
      )}

      {phase === "timeline" && <TimelinePage />}

      {/* Transition overlay (renders on top during phase switch) */}
      <PhaseTransition />
    </div>
  );
}
