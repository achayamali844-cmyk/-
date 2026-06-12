import type { GeminiModel } from "../../src/config/models";
import { extractTasksFromChatServer } from "../../src/services/aiCore";
import { isChatMessageList } from "../../src/server/api";
import {
  getErrorMessage,
  jsonResponse,
  parseJsonBody,
  requirePost,
  type NetlifyEvent,
  type NetlifyResponse,
} from "./_shared";

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const methodError = requirePost(event);
  if (methodError) return methodError;

  try {
    const { messages, modelName } = parseJsonBody<{ messages?: unknown; modelName?: GeminiModel }>(event);
    if (!isChatMessageList(messages)) {
      return jsonResponse(400, { error: "messages array is required" });
    }

    const tasks = await extractTasksFromChatServer(messages, modelName);
    return jsonResponse(200, { tasks });
  } catch (error) {
    console.error("Task extraction error:", error);
    return jsonResponse(500, { error: getErrorMessage(error) });
  }
}
