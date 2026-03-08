export interface TimelineStep {
  id: string
  index: number
  title: string
  description: string
  
  fullText?: string
  subtitle?: string

  duration?: string
  status: "pending" | "active" | "completed"
  branchId?: string

  prevId?: string | null
  nextIds?: string[]; 
}

export interface Branch {
  id: string;
  parentStepId: string;
  label: string;
  steps: TimelineStep[];
}

export interface Goal {
  id: string;
  raw_prompt: string;
  refined_prompt: string;
  title: string;
  summary: string;
  steps: TimelineStep[];
  branches: Branch[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export type AppPhase = "prompt" | "refining" | "transitioning" | "timeline";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Navigation types ───────────────────────────────────────

/** Identifies where the user is in the tree */
export interface NodeLocation {
  /** "main" or the branch id */
  branchId: "main" | string;
  /** Index within that branch's step array */
  stepIndex: number;
}

/** What the user can see from their current position */
export interface NodeContext {
  current: TimelineStep | null;
  previous: TimelineStep | null;
  /** Could be multiple if the step has branches forking off */
  next: TimelineStep[];
  /** Sibling branches at this depth (for left/right nav) */
  siblings: { branchId: "main" | string; step: TimelineStep }[];
  location: NodeLocation;
}

export interface TimelineNavState {
  /** Where the user currently is in the tree */
  location: NodeLocation;
  /** Cached context for current position */
  context: NodeContext;
  isAnimating: boolean;
  zoomLevel: number;
}