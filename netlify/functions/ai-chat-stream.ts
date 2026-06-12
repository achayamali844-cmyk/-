import type { GeminiModel } from "../../src/config/models";
import { createChatResponseTextStream } from "../../src/services/aiCore";
import { isChatMessageList } from "../../src/server/api";
import {
  getErrorMessage,
  jsonResponse,
  parseJsonBody,
  requirePost,
  textResponse,
  type NetlifyEvent,
  type NetlifyResponse,
} from "./_shared";

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const methodError = requirePost(event);
  if (methodError) return methodError;

  try {
    const { messages, systemInstruction, modelName } = parseJsonBody<{
      messages?: unknown;
      systemInstruction?: unknown;
      modelName?: GeminiModel;
    }>(event);

    if (!isChatMessageList(messages)) {
      return jsonResponse(400, { error: "messages array is required" });
    }

    const textStream = await createChatResponseTextStream(
      messages,
      typeof systemInstruction === "string" ? systemInstruction : undefined,
      modelName
    );

    let fullText = "";
    for await (const chunk of textStream) {
      fullText += chunk;
    }

    return textResponse(200, fullText);
  } catch (error) {
    console.error("Chat stream error:", error);
    return jsonResponse(500, { error: getErrorMessage(error) });
  }
}
