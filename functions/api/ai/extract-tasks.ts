import type { GeminiModel } from "../../../src/config/models";
import { extractTasksFromChatServer, setServerRuntimeEnv } from "../../../src/services/aiCore";
import { isChatMessageList } from "../../../src/server/api";
import {
  getErrorMessage,
  jsonResponse,
  parseJsonBody,
  requirePost,
  type PagesFunction,
} from "../../_shared";

export const onRequest: PagesFunction = async ({ request, env }) => {
  const methodError = requirePost(request);
  if (methodError) return methodError;

  try {
    setServerRuntimeEnv(env);
    const { messages, modelName } = await parseJsonBody<{ messages?: unknown; modelName?: GeminiModel }>(request);
    if (!isChatMessageList(messages)) {
      return jsonResponse(400, { error: "messages array is required" });
    }

    const tasks = await extractTasksFromChatServer(messages, modelName);
    return jsonResponse(200, { tasks });
  } catch (error) {
    console.error("Task extraction error:", error);
    return jsonResponse(500, { error: getErrorMessage(error) });
  }
};
