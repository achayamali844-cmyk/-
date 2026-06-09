import type { GeminiModel } from "../../src/config/models";
import { verifyStudyCheckInServer } from "../../src/services/aiCore";
import { getErrorMessage, requirePost, type JsonRequest, type JsonResponse } from "../../src/server/api";

export default async function handler(req: JsonRequest, res: JsonResponse) {
  if (!requirePost(req, res)) return;

  try {
    const { subject, taskDescription, userSummary, modelName } = req.body as {
      subject?: unknown;
      taskDescription?: unknown;
      userSummary?: unknown;
      modelName?: GeminiModel;
    };

    if (typeof subject !== "string" || typeof taskDescription !== "string" || typeof userSummary !== "string") {
      res.status(400).json({ error: "subject, taskDescription, and userSummary are required" });
      return;
    }

    const result = await verifyStudyCheckInServer(subject, taskDescription, userSummary, modelName);
    res.status(200).json({ result });
  } catch (error) {
    console.error("Study check-in verification error:", error);
    res.status(500).json({ error: getErrorMessage(error) });
  }
}
