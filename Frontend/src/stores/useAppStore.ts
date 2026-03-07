// ============================================================
// Ripple – Global State Store  (Zustand)
// ============================================================

import { create } from "zustand";
import type { AppPhase, Goal, ChatMessage, TimelineNavState } from "../types";

interface AppStore {
  // ----- Phase ---------------------------------------------------------------
  phase: AppPhase;
  setPhase: (p: AppPhase) => void;

  // ----- Goal ----------------------------------------------------------------
  currentGoal: Goal | null;
  setCurrentGoal: (g: Goal | null) => void;

  // ----- Chat (refinement) ---------------------------------------------------
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  clearMessages: () => void;

  // ----- Timeline navigation -------------------------------------------------
  nav: TimelineNavState;
  setNav: (partial: Partial<TimelineNavState>) => void;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Phase
  phase: "prompt",
  setPhase: (phase) => set({ phase }),

  // Goal
  currentGoal: null,
  setCurrentGoal: (currentGoal) =>
    set({
      currentGoal,
      nav: {
        currentStepIndex: 0,
        totalSteps: currentGoal?.steps.length ?? 0,
        isAnimating: false,
        zoomLevel: 1,
      },
    }),

  // Chat
  messages: [],
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  clearMessages: () => set({ messages: [] }),

  // Timeline nav
  nav: { currentStepIndex: 0, totalSteps: 0, isAnimating: false, zoomLevel: 1 },
  setNav: (partial) => set((s) => ({ nav: { ...s.nav, ...partial } })),
  goToStep: (index) => {
    const { nav } = get();
    if (index >= 0 && index < nav.totalSteps) {
      set({ nav: { ...nav, currentStepIndex: index, isAnimating: true } });
    }
  },
  nextStep: () => {
    const { nav } = get();
    if (nav.currentStepIndex < nav.totalSteps - 1) {
      set({ nav: { ...nav, currentStepIndex: nav.currentStepIndex + 1, isAnimating: true } });
    }
  },
  prevStep: () => {
    const { nav } = get();
    if (nav.currentStepIndex > 0) {
      set({ nav: { ...nav, currentStepIndex: nav.currentStepIndex - 1, isAnimating: true } });
    }
  },
}));
