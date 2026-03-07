// ============================================================
// Ripple – Mock Data  (remove once backend is connected)
// ============================================================

import type { Goal, ChatMessage } from "../types";
import { v4 } from "../utils/uid";

/** Generate a fake timeline from a user prompt (simulates Gemini response). */
export function generateMockGoal(prompt: string): Goal {
  const steps = [
    { title: "Define your vision", description: "Write down exactly what success looks like for this goal. Be specific about outcomes, not just intentions." },
    { title: "Audit current state", description: "Take stock of where you are right now relative to the goal. Identify gaps, resources, and blockers." },
    { title: "Break it into milestones", description: "Divide the journey into 3-5 major milestones that feel achievable on their own." },
    { title: "Build daily habits", description: "Identify 1-2 small daily actions that compound toward each milestone." },
    { title: "Set up accountability", description: "Find a partner, community, or system to keep yourself on track." },
    { title: "First milestone check-in", description: "Review progress on your first milestone. Adjust timelines and habits based on what you've learned." },
    { title: "Iterate and refine", description: "Apply lessons from the first milestone to accelerate through the remaining ones." },
    { title: "Final push", description: "Consolidate everything. Focus energy on closing out the last stretch." },
    { title: "Reflect and celebrate", description: "You made it. Document what worked, what didn't, and what's next." },
  ];

  return {
    id: v4(),
    raw_prompt: prompt,
    refined_prompt: prompt,
    title: prompt.length > 60 ? prompt.slice(0, 57) + "..." : prompt,
    summary: "A structured path to achieve your goal, broken into actionable steps.",
    steps: steps.map((s, i) => ({
      id: v4(),
      index: i,
      title: s.title,
      description: s.description,
      duration: `${(i + 1) * 3} days`,
      status: "pending" as const,
    })),
    branches: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/** Simulate a refinement chat exchange. */
export function generateMockRefinement(userMsg: string): ChatMessage {
  const responses = [
    "That's a solid goal. Let me break it down into concrete steps you can start working on right away.",
    "I've refined your goal into a clear timeline. Each step builds on the last — take a look.",
    "Great — I've structured this into phases. The first step is the most important one to nail.",
  ];
  return {
    id: v4(),
    role: "assistant",
    content: responses[Math.floor(Math.random() * responses.length)],
    timestamp: new Date().toISOString(),
  };
}
