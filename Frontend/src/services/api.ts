// ============================================================
// Ripple – API Service Layer
// ------------------------------------------------------------
// All backend communication funnels through here.
// Swap the base URL and implementations once the backend is live.
// ============================================================

import type { Goal, ChatMessage, ApiResponse } from "../types";

// ----- Configuration --------------------------------------------------------

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5173";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.detail || res.statusText };
    return { success: true, data: json as T };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ----- Goal endpoints -------------------------------------------------------

/** Submit an initial prompt and receive a refined goal + timeline. */
export async function submitGoal(prompt: string): Promise<ApiResponse<Goal>> {
  return request<Goal>("/api/goals", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}

/** Continue the refinement conversation with an additional message. */
export async function refineGoal(
  goalId: string,
  message: string
): Promise<ApiResponse<{ goal: Goal; messages: ChatMessage[] }>> {
  return request("/api/goals/" + goalId + "/refine", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

/** Fetch an existing goal by ID (for future history features). */
export async function getGoal(goalId: string): Promise<ApiResponse<Goal>> {
  return request<Goal>("/api/goals/" + goalId);
}

// ----- Voice endpoints (ElevenLabs) -----------------------------------------

/** Send text and get back an audio blob URL for playback. */
export async function textToSpeech(text: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/voice/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/** Upload an audio blob for speech-to-text transcription. */
export async function speechToText(audioBlob: Blob): Promise<string | null> {
  try {
    const form = new FormData();
    form.append("audio", audioBlob);
    const res = await fetch(`${API_BASE}/api/voice/stt`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.transcript ?? null;
  } catch {
    return null;
  }
}
