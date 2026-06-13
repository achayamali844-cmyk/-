import type { GeminiModel } from "../../../src/config/models";
import { setServerRuntimeEnv, verifyStudyCheckInServer } from "../../../src/services/aiCore";
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
    const { subject, taskDescription, userSummary, modelName } = await parseJsonBody<{
      subject?: unknown;
      taskDescription?: unknown;
      userSummary?: unknown;
      modelName?: GeminiModel;
    }>(request);

    if (typeof subject !== "string" || typeof taskDescription !== "string" || typeof userSummary !== "string") {
      return jsonResponse(400, { error: "subject, taskDescription, and userSummary are required" });
    }

    const result = await verifyStudyCheckInServer(subject, taskDescription, userSummary, modelName);
    return jsonResponse(200, { result });
  } catch (error) {
    console.error("Study check-in verification error:", error);
    return jsonResponse(500, { error: getErrorMessage(error) });
  }
};
