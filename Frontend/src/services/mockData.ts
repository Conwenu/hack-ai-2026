import type { Goal, ChatMessage, Branch } from "../types";
import { v4 } from "../utils/uid";

export function generateMockGoal(prompt: string): Goal {
  const stepDefs = [
    { title: "Define your vision",      description: "Write down exactly what success looks like for this goal. Be specific about outcomes, not just intentions." },
    { title: "Audit current state",     description: "Take stock of where you are right now relative to the goal. Identify gaps, resources, and blockers." },
    { title: "Break it into milestones",description: "Divide the journey into 3-5 major milestones that feel achievable on their own." },
    { title: "Build daily habits",      description: "Identify 1-2 small daily actions that compound toward each milestone." },
    { title: "Set up accountability",   description: "Find a partner, community, or system to keep yourself on track." },
    { title: "First milestone check-in",description: "Review progress on your first milestone. Adjust timelines and habits based on what you've learned." },
    { title: "Iterate and refine",      description: "Apply lessons from the first milestone to accelerate through the remaining ones." },
    { title: "Final push",              description: "Consolidate everything. Focus energy on closing out the last stretch." },
    { title: "Reflect and celebrate",   description: "You made it. Document what worked, what didn't, and what's next." },
  ];

  // The step index that owns the mock branch
  const BRANCH_PARENT_INDEX = 2;
  const branchId = v4();

  const steps = stepDefs.map((s, i) => ({
    id: v4(),
    index: i,
    title: s.title,
    description: s.description,
    duration: `${(i + 1) * 3} days`,
    status: "pending" as const,
    branchId: i === BRANCH_PARENT_INDEX ? branchId : undefined,
  }));

  const mockBranch: Branch = {
    id: branchId,
    parentStepId: steps[BRANCH_PARENT_INDEX].id,
    label: "Deep dive: milestone planning",
    steps: [
      {
        id: v4(),
        index: 0,
        title: "Research best practices",
        description: "Survey how others have broken down similar goals into milestones.",
        duration: "2 days",
        status: "pending",
      },
      {
        id: v4(),
        index: 1,
        title: "Draft milestone map",
        description: "Sketch out a visual map of your milestones and dependencies.",
        duration: "1 day",
        status: "pending",
      },
      {
        id: v4(),
        index: 2,
        title: "Validate with a mentor",
        description: "Share your milestone map with someone experienced and gather feedback.",
        duration: "2 days",
        status: "pending",
      },
    ],
  };

  return {
    id: v4(),
    raw_prompt: prompt,
    refined_prompt: prompt,
    title: prompt.length > 60 ? prompt.slice(0, 57) + "..." : prompt,
    summary: "A structured path to achieve your goal, broken into actionable steps.",
    steps,
    branches: [mockBranch],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

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