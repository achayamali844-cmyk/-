import type { GeminiModel } from "../../../src/config/models";
import { createChatResponseTextStream, setServerRuntimeEnv } from "../../../src/services/aiCore";
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
    const { messages, systemInstruction, modelName } = await parseJsonBody<{
      messages?: unknown;
      systemInstruction?: unknown;
      modelName?: GeminiModel;
    }>(request);

    if (!isChatMessageList(messages)) {
      return jsonResponse(400, { error: "messages array is required" });
    }

    const textStream = await createChatResponseTextStream(
      messages,
      typeof systemInstruction === "string" ? systemInstruction : undefined,
      modelName
    );

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("Chat stream error:", error);
    return jsonResponse(500, { error: getErrorMessage(error) });
  }
};
