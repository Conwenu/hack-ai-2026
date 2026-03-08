// ============================================================
// Ripple – API Service Layer
// ------------------------------------------------------------
// Connects to the FastAPI backend which uses Ollama to generate
// step-by-step plans. No mock data — real LLM output.
// ============================================================

import type { Goal, ApiResponse } from "../types";
import { v4 } from "../utils/uid";

// ----- Configuration --------------------------------------------------------

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ----- Goal endpoint --------------------------------------------------------

/**
 * Submit a goal prompt to the backend.
 * The backend calls Ollama (llama3.1:8b) and returns structured steps.
 * We map the backend response into the frontend Goal type.
 */
export async function submitGoal(prompt: string): Promise<ApiResponse<Goal>> {
  try {
    const res = await fetch(`${API_BASE}/generate-steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal: prompt }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      return { success: false, error: err.detail || res.statusText };
    }

    const data = await res.json();

    // Backend returns: { steps: [{ id, prevStep, nextStep, title, subtitle, text }, ...] }
    // Map to frontend Goal shape
    const goal: Goal = {
      id: v4(),
      raw_prompt: prompt,
      refined_prompt: prompt,
      title: prompt.length > 60 ? prompt.slice(0, 57) + "..." : prompt,
      summary: "AI-generated plan powered by Ollama.",
      steps: data.steps.map(
        (
          s: {
            id: string;
            title: string;
            subtitle: string;
            text: string;
          },
          i: number
        ) => ({
          id: s.id,
          index: i,
          title: s.title,
          description: s.subtitle,
          duration: undefined,
          status: "pending" as const,
          metadata: {
            subtitle: s.subtitle,
            fullText: s.text,
          },
        })
      ),
      branches: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { success: true, data: goal };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}