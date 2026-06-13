export type PagesEnv = Record<string, unknown> & {
  GEMINI_API_KEY?: string;
  NOTION_API_KEY?: string;
  NOTION_DATABASE_ID?: string;
};

export type PagesContext = {
  request: Request;
  env: PagesEnv;
};

export type PagesFunction = (context: PagesContext) => Response | Promise<Response>;

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export function textResponse(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

export function requirePost(request: Request): Response | null {
  if (request.method === "POST") return null;
  return jsonResponse(405, { error: "Method not allowed" });
}

export async function parseJsonBody<T = unknown>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown server error";
}
