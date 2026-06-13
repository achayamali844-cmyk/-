import { GoogleGenAI, Type } from "@google/genai";
import { DEFAULT_GEMINI_MODEL, DEFAULT_TASK_GEMINI_MODEL, type GeminiModel } from "../config/models";
import {
  STUDY_CHECK_IN_PASSING_SCORE,
  STUDY_CHECK_IN_SYSTEM_PROMPT,
  TASK_EXTRACTION_SYSTEM_PROMPT,
  buildStudyCheckInPrompt,
} from "./prompts";
import type { ChatMessage, StudyCheckInResult, TaskItem } from "./aiTypes";

const GEMINI_API_KEY_PLACEHOLDER = "MY_GEMINI_API_KEY";
const MISSING_KEY_MESSAGE = "GEMINI_API_KEY is missing. Configure it in your deployment environment variables or .env.local.";

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };
type ServerRuntimeEnv = Record<string, unknown>;

let aiClient: GoogleGenAI | null = null;
let aiClientApiKey = "";
let serverRuntimeEnv: ServerRuntimeEnv = {};

export function setServerRuntimeEnv(env: ServerRuntimeEnv = {}) {
  serverRuntimeEnv = env;
}

function getRuntimeEnvValue(name: string): string {
  const injectedValue = serverRuntimeEnv[name];
  if (typeof injectedValue === "string" && injectedValue.trim()) {
    return injectedValue.trim();
  }

  const processValue = typeof process !== "undefined" ? process.env?.[name] : undefined;
  return typeof processValue === "string" ? processValue.trim() : "";
}

function getGeminiApiKey(): string {
  return getRuntimeEnvValue("GEMINI_API_KEY");
}

function getAiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey || apiKey === GEMINI_API_KEY_PLACEHOLDER) {
    throw new Error(MISSING_KEY_MESSAGE);
  }

  if (!aiClient || aiClientApiKey !== apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
    aiClientApiKey = apiKey;
  }
  return aiClient;
}

function extractBalancedJson(text: string, startIndex: number): string | null {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{" || char === "[") {
      stack.push(char === "{" ? "}" : "]");
      continue;
    }

    if (char === "}" || char === "]") {
      const expected = stack.pop();
      if (char !== expected) return null;
      if (stack.length === 0) return text.slice(startIndex, index + 1);
    }
  }

  return null;
}

function collectJsonCandidates(text: string): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const addCandidate = (candidate: string | undefined) => {
    const normalized = candidate?.trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    candidates.push(normalized);
  };

  addCandidate(text);

  for (const match of text.matchAll(/```(?:json)?\s*([\s\S]*?)\s*```/gi)) {
    addCandidate(match[1]);
  }

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === "{" || char === "[") {
      addCandidate(extractBalancedJson(text, index) ?? undefined);
    }
  }

  return candidates;
}

function parseJsonResponse<T>(text: string | undefined, fallback: T): T {
  if (!text?.trim()) return fallback;

  for (const candidate of collectJsonCandidates(text)) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // Try the next candidate.
    }
  }

  return fallback;
}

function getTextValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function compactText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function getTaskList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const maybeTasks = (value as { tasks?: unknown }).tasks;
    if (Array.isArray(maybeTasks)) return maybeTasks;
  }
  return [];
}

function normalizeTasks(value: unknown): TaskItem[] {
  const seen = new Set<string>();

  return getTaskList(value)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const task = item as Partial<TaskItem> & { title?: unknown; details?: unknown };
      const name = compactText(getTextValue(task.name) || getTextValue(task.title), 120);
      const description = compactText(getTextValue(task.description) || getTextValue(task.details), 500);
      if (!name || !description) return null;
      const key = name.toLocaleLowerCase();
      if (seen.has(key)) return null;
      seen.add(key);
      return { name, description };
    })
    .filter((item): item is TaskItem => Boolean(item));
}

function clampScore(score: unknown): number {
  const parsed = typeof score === "number" ? score : Number(score);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function toGeminiContents(messages: ChatMessage[]) {
  return messages.map((msg) => {
    const parts: GeminiPart[] = [];
    if (msg.text) {
      parts.push({ text: msg.text });
    }
    if (msg.files) {
      msg.files.forEach((file) => {
        parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
      });
    }
    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts,
    };
  });
}

export async function extractTasksFromChatServer(
  messages: ChatMessage[],
  modelName: GeminiModel = DEFAULT_TASK_GEMINI_MODEL
): Promise<TaskItem[]> {
  const contents = messages.map((msg) => {
    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    };
  });

  const response = await getAiClient().models.generateContent({
    model: modelName,
    contents,
    config: {
      systemInstruction: TASK_EXTRACTION_SYSTEM_PROMPT,
      temperature: 0.1,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["name", "description"],
        },
      },
    },
  });

  return normalizeTasks(parseJsonResponse<unknown>(response.text, []));
}

export async function verifyStudyCheckInServer(
  subject: string,
  taskDescription: string,
  userSummary: string,
  modelName: GeminiModel = DEFAULT_TASK_GEMINI_MODEL
): Promise<StudyCheckInResult> {
  const normalizedSummary = userSummary.trim();
  if (normalizedSummary.length < 5) {
    return { passed: false, message: "请补充更具体的学习过程。", score: 0 };
  }

  const response = await getAiClient().models.generateContent({
    model: modelName,
    contents: buildStudyCheckInPrompt({
      subject: subject.trim(),
      taskDescription: taskDescription.trim(),
      userSummary: normalizedSummary,
    }),
    config: {
      systemInstruction: STUDY_CHECK_IN_SYSTEM_PROMPT,
      temperature: 0.1,
      maxOutputTokens: 512,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          passed: { type: Type.BOOLEAN, description: "是否通过验证" },
          message: { type: Type.STRING, description: "给学生的简短点评（10-30字）" },
          score: { type: Type.INTEGER, description: "打卡评分 0-100" },
        },
        required: ["passed", "message", "score"],
      },
    },
  });

  const result = parseJsonResponse<Partial<StudyCheckInResult>>(response.text, {});
  const score = clampScore(result.score);
  return {
    passed: Boolean(result.passed) && score >= STUDY_CHECK_IN_PASSING_SCORE,
    message: typeof result.message === "string" && result.message.trim()
      ? result.message.trim()
      : "请补充更具体的学习过程。",
    score,
  };
}

export async function createChatResponseTextStream(
  messages: ChatMessage[],
  systemInstruction?: string,
  modelName: GeminiModel = DEFAULT_GEMINI_MODEL
): Promise<AsyncIterable<string>> {
  const responseStream = await getAiClient().models.generateContentStream({
    model: modelName,
    contents: toGeminiContents(messages),
    config: {
      systemInstruction: systemInstruction || undefined,
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });

  return (async function* textChunks() {
    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  })();
}
