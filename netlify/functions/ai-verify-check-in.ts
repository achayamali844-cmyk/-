import type { GeminiModel } from "../../src/config/models";
import { verifyStudyCheckInServer } from "../../src/services/aiCore";
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
    const { subject, taskDescription, userSummary, modelName } = parseJsonBody<{
      subject?: unknown;
      taskDescription?: unknown;
      userSummary?: unknown;
      modelName?: GeminiModel;
    }>(event);

    if (typeof subject !== "string" || typeof taskDescription !== "string" || typeof userSummary !== "string") {
      return jsonResponse(400, { error: "subject, taskDescription, and userSummary are required" });
    }

    const result = await verifyStudyCheckInServer(subject, taskDescription, userSummary, modelName);
    return jsonResponse(200, { result });
  } catch (error) {
    console.error("Study check-in verification error:", error);
    return jsonResponse(500, { error: getErrorMessage(error) });
  }
}
