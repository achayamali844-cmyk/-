import { DEFAULT_GEMINI_MODEL, DEFAULT_TASK_GEMINI_MODEL, type GeminiModel } from "../config/models";
import type { ChatMessage, StudyCheckInResult, TaskItem } from "./aiTypes";

export type { ChatMessage, StudyCheckInResult, TaskItem };

async function readApiError(response: Response): Promise<string> {
  try {
    const data = await response.json() as { error?: unknown };
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error.trim();
    }
  } catch {
    // Fall back to status text below.
  }

  return response.statusText || "Request failed";
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<T>;
}

export async function extractTasksFromChat(
  messages: ChatMessage[],
  modelName: GeminiModel = DEFAULT_TASK_GEMINI_MODEL
): Promise<TaskItem[]> {
  try {
    const data = await postJson<{ tasks: TaskItem[] }>("/api/ai/extract-tasks", { messages, modelName });
    return data.tasks;
  } catch (error) {
    console.error("Task extraction failed", error);
    return [];
  }
}

export async function verifyStudyCheckIn(
  subject: string,
  taskDescription: string,
  userSummary: string,
  modelName: GeminiModel = DEFAULT_TASK_GEMINI_MODEL
): Promise<StudyCheckInResult> {
  const normalizedSummary = userSummary.trim();
  if (normalizedSummary.length < 5) {
    return { passed: false, message: "请补充更具体的学习过程。", score: 0 };
  }

  try {
    const data = await postJson<{ result: StudyCheckInResult }>("/api/ai/verify-check-in", {
      subject,
      taskDescription,
      userSummary: normalizedSummary,
      modelName,
    });
    return data.result;
  } catch (error) {
    console.error("Verification failed", error);
    return { passed: false, message: "AI 验证出错，请重试。", score: 0 };
  }
}

export async function generateChatResponseStream(
  messages: ChatMessage[],
  systemInstruction?: string,
  modelName: GeminiModel = DEFAULT_GEMINI_MODEL,
  onChunk?: (textChunk: string) => void
) {
  const response = await fetch("/api/ai/chat-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, systemInstruction, modelName }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
    onChunk?.(fullText);
  }

  const finalChunk = decoder.decode();
  if (finalChunk) {
    fullText += finalChunk;
    onChunk?.(fullText);
  }

  return fullText;
}
