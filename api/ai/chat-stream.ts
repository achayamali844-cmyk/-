import type { GeminiModel } from "../../src/config/models";
import { createChatResponseTextStream } from "../../src/services/aiCore";
import {
  getErrorMessage,
  isChatMessageList,
  requirePost,
  type JsonRequest,
  type JsonResponse,
} from "../../src/server/api";

export default async function handler(req: JsonRequest, res: JsonResponse) {
  if (!requirePost(req, res)) return;

  try {
    const { messages, systemInstruction, modelName } = req.body as {
      messages?: unknown;
      systemInstruction?: unknown;
      modelName?: GeminiModel;
    };

    if (!isChatMessageList(messages)) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    const textStream = await createChatResponseTextStream(
      messages,
      typeof systemInstruction === "string" ? systemInstruction : undefined,
      modelName
    );

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");

    for await (const chunk of textStream) {
      res.write(chunk);
    }
    res.end();
  } catch (error) {
    console.error("Chat stream error:", error);
    res.status(500).json({ error: getErrorMessage(error) });
  }
}
