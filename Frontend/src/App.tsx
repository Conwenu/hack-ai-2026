import { useAppStore } from "./stores/useAppStore";
import DashboardPage from "./pages/DashboardPage";
import TimelinePage from "./pages/TimelinePage";
import PhaseTransition from "./components/Layout/PhaseTransition";

export default function App() {
  const phase = useAppStore((s) => s.phase);

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden">
      {phase !== "timeline" && <DashboardPage />}
      {phase === "timeline" && <TimelinePage />}
      <PhaseTransition />
    </div>
  );
}
