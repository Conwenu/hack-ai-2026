import { create } from "zustand";
import type {
  AppPhase,
  Goal,
  ChatMessage,
  TimelineNavState,
  Branch,
  NodeLocation,
  NodeContext,
  TimelineStep,
} from "../types";

// ─── helpers ────────────────────────────────────────────────

/**
 * Collect all "tracks" a user can left/right between.
 *
 * A track is: main line, or any branch. Each track has a depth
 * offset so we can map positions across tracks.
 *
 * For a branch off main step N:
 *   - branch step 0 is at "depth" N+1 (one below the parent)
 *   - branch step 1 is at depth N+2, etc.
 *
 * The main line is:
 *   - main step 0 at depth 0, step 1 at depth 1, etc.
 */
interface Track {
  branchId: "main" | string;
  /** The depth of step 0 in this track */
  depthOffset: number;
  steps: TimelineStep[];
}

function getAllTracks(goal: Goal): Track[] {
  const tracks: Track[] = [
    { branchId: "main", depthOffset: 0, steps: goal.steps },
  ];

  for (const branch of goal.branches) {
    const parentIdx = goal.steps.findIndex(
      (s) => s.id === branch.parentStepId
    );
    if (parentIdx >= 0 && branch.steps.length > 0) {
      tracks.push({
        branchId: branch.id,
        depthOffset: parentIdx + 1,
        steps: branch.steps,
      });
    }
  }

  return tracks;
}

function getDepth(track: Track, stepIndex: number): number {
  return track.depthOffset + stepIndex;
}

function buildContext(goal: Goal | null, location: NodeLocation): NodeContext {
  const empty: NodeContext = {
    current: null,
    previous: null,
    next: [],
    siblings: [],
    location,
  };
  if (!goal) return empty;

  const { branchId, stepIndex } = location;

  const stepsArray =
    branchId === "main"
      ? goal.steps
      : goal.branches.find((b) => b.id === branchId)?.steps ?? [];

  const current = stepsArray[stepIndex] ?? null;
  const previous = stepIndex > 0 ? stepsArray[stepIndex - 1] : null;

  // "Next" along the current branch
  const nextInLine =
    stepIndex < stepsArray.length - 1 ? [stepsArray[stepIndex + 1]] : [];

  // Also include any branch heads that fork from this step
  const branchHeads: TimelineStep[] = [];
  if (current) {
    for (const branch of goal.branches) {
      if (branch.parentStepId === current.id && branch.steps.length > 0) {
        branchHeads.push(branch.steps[0]);
      }
    }
  }
  const next = [...nextInLine, ...branchHeads];

  // ── Siblings: any other track that has a node at the same depth ──
  const siblings: NodeContext["siblings"] = [];
  if (current) {
    const tracks = getAllTracks(goal);
    const currentTrack = tracks.find((t) => t.branchId === branchId);
    if (currentTrack) {
      const currentDepth = getDepth(currentTrack, stepIndex);

      for (const track of tracks) {
        if (track.branchId === branchId) continue; // skip self

        // What stepIndex in this track corresponds to currentDepth?
        const siblingStepIndex = currentDepth - track.depthOffset;

        // Clamp: if the user is deeper than the track goes, jump to the last step
        // If the user is shallower than the track starts, skip this track
        if (siblingStepIndex < 0) continue;

        const clampedIndex = Math.min(
          siblingStepIndex,
          track.steps.length - 1
        );

        siblings.push({
          branchId: track.branchId,
          step: track.steps[clampedIndex],
        });
      }
    }
  }

  return { current, previous, next, siblings, location };
}

function defaultLocation(): NodeLocation {
  return { branchId: "main", stepIndex: 0 };
}

function defaultNav(): TimelineNavState {
  return {
    location: defaultLocation(),
    context: {
      current: null,
      previous: null,
      next: [],
      siblings: [],
      location: defaultLocation(),
    },
    isAnimating: false,
    zoomLevel: 1,
  };
}

// ─── store ──────────────────────────────────────────────────

interface AppStore {
  phase: AppPhase;
  setPhase: (p: AppPhase) => void;

  currentGoal: Goal | null;
  setCurrentGoal: (g: Goal | null) => void;
  addBranch: (branch: Branch) => void;

  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  clearMessages: () => void;

  nav: TimelineNavState;
  setNav: (partial: Partial<TimelineNavState>) => void;

  navigateTo: (location: NodeLocation) => void;
  moveDown: () => void;
  moveUp: () => void;
  moveRight: () => void;
  moveLeft: () => void;

  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  phase: "prompt",
  setPhase: (phase) => set({ phase }),

  currentGoal: null,
  setCurrentGoal: (currentGoal) => {
    const loc = defaultLocation();
    set({
      currentGoal,
      nav: {
        location: loc,
        context: buildContext(currentGoal, loc),
        isAnimating: false,
        zoomLevel: 1,
      },
    });
  },

  addBranch: (branch) => {
    const { currentGoal, nav } = get();
    if (!currentGoal) return;

    const steps = currentGoal.steps.map((s) =>
      s.id === branch.parentStepId ? { ...s, branchId: branch.id } : s
    );

    const updatedGoal = {
      ...currentGoal,
      steps,
      branches: [...currentGoal.branches, branch],
    };

    set({
      currentGoal: updatedGoal,
      nav: {
        ...nav,
        context: buildContext(updatedGoal, nav.location),
      },
    });
  },

  messages: [],
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  clearMessages: () => set({ messages: [] }),

  nav: defaultNav(),
  setNav: (partial) => set((s) => ({ nav: { ...s.nav, ...partial } })),

  navigateTo: (location) => {
    const { currentGoal } = get();
    set({
      nav: {
        location,
        context: buildContext(currentGoal, location),
        isAnimating: true,
        zoomLevel: get().nav.zoomLevel,
      },
    });
  },

  // Down arrow = go deeper into timeline (higher step index)
  moveDown: () => {
    const { nav, currentGoal } = get();
    const { branchId, stepIndex } = nav.location;
    const stepsArray =
      branchId === "main"
        ? currentGoal?.steps ?? []
        : currentGoal?.branches.find((b) => b.id === branchId)?.steps ?? [];

    if (stepIndex < stepsArray.length - 1) {
      get().navigateTo({ branchId, stepIndex: stepIndex + 1 });
    }
  },

  // Up arrow = go back toward start (lower step index)
  moveUp: () => {
    const { nav } = get();
    const { branchId, stepIndex } = nav.location;
    if (stepIndex > 0) {
      get().navigateTo({ branchId, stepIndex: stepIndex - 1 });
    } else if (branchId !== "main") {
      const { currentGoal } = get();
      const branch = currentGoal?.branches.find((b) => b.id === branchId);
      if (branch && currentGoal) {
        const parentIdx = currentGoal.steps.findIndex(
          (s) => s.id === branch.parentStepId
        );
        if (parentIdx >= 0) {
          get().navigateTo({ branchId: "main", stepIndex: parentIdx });
        }
      }
    }
  },

  moveRight: () => {
    const { nav, currentGoal } = get();
    if (!currentGoal) return;
    const { siblings } = nav.context;
    if (siblings.length === 0) return;

    // Build ordered track list: [current, ...siblings]
    const tracks = getAllTracks(currentGoal);
    const currentTrackIdx = tracks.findIndex(
      (t) => t.branchId === nav.location.branchId
    );

    // Find the next track to the right that has a sibling entry
    const siblingBranchIds = new Set(siblings.map((s) => s.branchId));
    for (let offset = 1; offset < tracks.length; offset++) {
      const idx = (currentTrackIdx + offset) % tracks.length;
      const track = tracks[idx];
      if (siblingBranchIds.has(track.branchId)) {
        const sibling = siblings.find((s) => s.branchId === track.branchId)!;
        const targetStepIndex =
          track.branchId === "main"
            ? currentGoal.steps.findIndex((st) => st.id === sibling.step.id)
            : currentGoal.branches
                .find((b) => b.id === track.branchId)
                ?.steps.findIndex((st) => st.id === sibling.step.id) ?? 0;
        get().navigateTo({ branchId: track.branchId, stepIndex: targetStepIndex });
        return;
      }
    }
  },

  moveLeft: () => {
    const { nav, currentGoal } = get();
    if (!currentGoal) return;
    const { siblings } = nav.context;
    if (siblings.length === 0) return;

    const tracks = getAllTracks(currentGoal);
    const currentTrackIdx = tracks.findIndex(
      (t) => t.branchId === nav.location.branchId
    );

    const siblingBranchIds = new Set(siblings.map((s) => s.branchId));
    for (let offset = 1; offset < tracks.length; offset++) {
      const idx =
        (currentTrackIdx - offset + tracks.length) % tracks.length;
      const track = tracks[idx];
      if (siblingBranchIds.has(track.branchId)) {
        const sibling = siblings.find((s) => s.branchId === track.branchId)!;
        const targetStepIndex =
          track.branchId === "main"
            ? currentGoal.steps.findIndex((st) => st.id === sibling.step.id)
            : currentGoal.branches
                .find((b) => b.id === track.branchId)
                ?.steps.findIndex((st) => st.id === sibling.step.id) ?? 0;
        get().navigateTo({ branchId: track.branchId, stepIndex: targetStepIndex });
        return;
      }
    }
  },

  goToStep: (index) => {
    get().navigateTo({ branchId: "main", stepIndex: index });
  },
  nextStep: () => get().moveDown(),
  prevStep: () => get().moveUp(),
}));
