// ============================================================
// Ripple – API Service Layer
// ------------------------------------------------------------
// Connects to the FastAPI backend which uses Gemini to generate
// step-by-step plans. No mock data — real LLM output.
// ============================================================

import type { Goal, ApiResponse } from "../types";
import { v4 } from "../utils/uid";

// ----- Configuration --------------------------------------------------------

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ----- TTS via narration endpoint -------------------------------------------

export async function fetchTTS(
  current: { id: string; index: number; title: string; subtitle: string; fullText: string },
  previous?: { id: string; index: number; title: string; subtitle: string; fullText: string } | null,
) {
  const body: Record<string, unknown> = { current };
  if (previous) body.previous = previous;

  const response = await fetch(`${API_BASE}/narration/`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    return { success: false, text: null, audio: null };
  }

  const data = await response.json();

  // data = { text: "...", audio_base64: "..." | null }
  let audioBlob: Blob | null = null;
  if (data.audio_base64) {
    const binaryString = atob(data.audio_base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    audioBlob = new Blob([bytes], { type: "audio/mpeg" });
  }

  return {
    success: true,
    text: data.text as string,
    audio: audioBlob,
  };
}

// ----- Branch generation ----------------------------------------------------

export async function generateBranch(
  branchPrompt: string,
  nodeTitle: string,
  nodeSubtitle: string,
  nodeText: string,
): Promise<ApiResponse<{ steps: Array<{ id: string; title: string; subtitle: string; text: string }> }>> {
  try {
    const res = await fetch(`${API_BASE}/generate-branch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branchPrompt,
        nodeTitle,
        nodeSubtitle,
        nodeText,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      return { success: false, error: err.detail || res.statusText };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ----- Goal endpoint --------------------------------------------------------

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

    const goal: Goal = {
      id: v4(),
      raw_prompt: prompt,
      refined_prompt: prompt,
      title: prompt.length > 60 ? prompt.slice(0, 57) + "..." : prompt,
      summary: "AI-generated plan powered by Gemini.",
      steps: data.steps.map(
        (
          s: {
            id: string;
            title: string;
            subtitle: string;
            text: string;
          },
          i: number,
          arr: typeof data.steps,
        ) => ({
          id: s.id,
          index: i,

          title: s.title,
          description: s.subtitle,
          subtitle: s.subtitle,
          fullText: s.text,

          duration: undefined,
          status: "pending" as const,

          prevId: i === 0 ? null : arr[i - 1].id,
          nextIds: i < arr.length - 1 ? [arr[i + 1].id] : [],
        }),
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