// ============================================================
// Ripple – Core Type Definitions
// ============================================================

/** A single atomic step inside a goal timeline. */
export interface TimelineStep {
  id: string;
  index: number;
  title: string;
  description: string;
  duration?: string;          // e.g. "2 weeks"
  status: "pending" | "active" | "completed";
  branchId?: string;          // links to a Branch if this step spawns one
  metadata?: Record<string, unknown>;
}

/** A branch represents an alternative path or sub-goal. */
export interface Branch {
  id: string;
  parentStepId: string;
  label: string;
  steps: TimelineStep[];
}

/** The top-level goal object returned by the backend. */
export interface Goal {
  id: string;
  raw_prompt: string;          // what the user originally typed
  refined_prompt: string;      // after Gemini refinement
  title: string;
  summary: string;
  steps: TimelineStep[];
  branches: Branch[];
  createdAt: string;
  updatedAt: string;
}

/** Chat message between user and AI during goal refinement. */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

/** The current phase of the app experience. */
export type AppPhase = "prompt" | "refining" | "transitioning" | "timeline";

/** Backend API response wrapper. */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Timeline camera / navigation state. */
export interface TimelineNavState {
  currentStepIndex: number;
  totalSteps: number;
  isAnimating: boolean;
  zoomLevel: number;
}
