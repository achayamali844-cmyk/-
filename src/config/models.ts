export const DEFAULT_CHAT_GEMINI_MODEL = 'gemini-3.5-flash' as const;
export const DEFAULT_GEMINI_MODEL = DEFAULT_CHAT_GEMINI_MODEL;
export const DEFAULT_TASK_GEMINI_MODEL = 'gemini-3.1-flash-lite' as const;

export const GEMINI_MODELS = [
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview' },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite' },
] as const;

export type GeminiModel = (typeof GEMINI_MODELS)[number]['id'];

export function isGeminiModel(model: unknown): model is GeminiModel {
  return typeof model === 'string' && GEMINI_MODELS.some((item) => item.id === model);
}
