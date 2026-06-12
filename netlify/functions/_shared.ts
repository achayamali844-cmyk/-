export type NetlifyEvent = {
  httpMethod: string;
  body?: string | null;
  isBase64Encoded?: boolean;
};

export type NetlifyResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

export function jsonResponse(statusCode: number, body: unknown): NetlifyResponse {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  };
}

export function textResponse(statusCode: number, body: string): NetlifyResponse {
  return {
    statusCode,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
    body,
  };
}

export function requirePost(event: NetlifyEvent): NetlifyResponse | null {
  if (event.httpMethod === "POST") return null;
  return jsonResponse(405, { error: "Method not allowed" });
}

export function parseJsonBody<T = unknown>(event: NetlifyEvent): T {
  const rawBody = event.body ?? "";
  const text = event.isBase64Encoded
    ? Buffer.from(rawBody, "base64").toString("utf8")
    : rawBody;
  return JSON.parse(text || "{}") as T;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown server error";
}
