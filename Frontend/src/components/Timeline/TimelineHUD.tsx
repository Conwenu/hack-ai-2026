// ============================================================
// Ripple – TimelineHUD  (2D overlay on top of 3D scene)
// ============================================================

import { useAppStore } from "../../stores/useAppStore";

export default function TimelineHUD() {
  const { currentGoal, nav, nextStep, prevStep } = useAppStore();
  const step = currentGoal?.steps[nav.currentStepIndex];

  if (!step) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top-left: goal title */}
      <div className="absolute top-6 left-6">
        <p className="text-xs text-white/30 uppercase tracking-widest">
          Your Goal
        </p>
        <h2 className="text-lg text-white/80 font-light mt-1 max-w-sm truncate">
          {currentGoal?.title}
        </h2>
      </div>

      {/* Top-right: step counter */}
      <div className="absolute top-6 right-6 text-right">
        <p className="text-xs text-white/30 uppercase tracking-widest">Step</p>
        <p className="text-2xl font-light text-white/80 tabular-nums">
          {nav.currentStepIndex + 1}
          <span className="text-white/20"> / {nav.totalSteps}</span>
        </p>
      </div>

      {/* Bottom: active step detail card */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pointer-events-auto">
        <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-lg px-6 py-4">
          <h3 className="text-sm font-medium text-white/90">{step.title}</h3>
          <p className="text-xs text-white/40 mt-2 leading-relaxed">
            {step.description}
          </p>
          {step.duration && (
            <p className="text-[11px] text-white/20 mt-2">
              Est. {step.duration}
            </p>
          )}
        </div>
      </div>

      {/* Bottom nav arrows */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
        <button
          onClick={prevStep}
          disabled={nav.currentStepIndex === 0}
          className="px-3 py-1.5 rounded-lg text-xs text-white/50 border border-white/10
                     hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        <button
          onClick={nextStep}
          disabled={nav.currentStepIndex === nav.totalSteps - 1}
          className="px-3 py-1.5 rounded-lg text-xs text-white/50 border border-white/10
                     hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
