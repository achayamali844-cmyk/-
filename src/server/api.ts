import type { ChatMessage } from "../services/aiTypes";

export type JsonResponse = {
  status(code: number): JsonResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
  write(chunk: string): void;
  end(): void;
};

export type JsonRequest = {
  method?: string;
  body?: unknown;
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown server error";
}

export function isChatMessageList(value: unknown): value is ChatMessage[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const message = item as Partial<ChatMessage>;
    return typeof message.id === "string"
      && (message.role === "user" || message.role === "model")
      && typeof message.text === "string";
  });
}

export function requirePost(req: JsonRequest, res: JsonResponse): boolean {
  if (req.method === "POST") return true;
  res.status(405).json({ error: "Method not allowed" });
  return false;
}
