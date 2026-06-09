import type { GeminiModel } from "../../src/config/models";
import { extractTasksFromChatServer } from "../../src/services/aiCore";
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
    const { messages, modelName } = req.body as { messages?: unknown; modelName?: GeminiModel };
    if (!isChatMessageList(messages)) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    const tasks = await extractTasksFromChatServer(messages, modelName);
    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Task extraction error:", error);
    res.status(500).json({ error: getErrorMessage(error) });
  }
}
