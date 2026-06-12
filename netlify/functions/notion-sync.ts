import { Client } from "@notionhq/client";
import {
  getErrorMessage,
  jsonResponse,
  parseJsonBody,
  requirePost,
  type NetlifyEvent,
  type NetlifyResponse,
} from "./_shared";

type NotionTask = {
  name?: unknown;
  description?: unknown;
};

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const methodError = requirePost(event);
  if (methodError) return methodError;

  try {
    const apiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!apiKey || !databaseId) {
      return jsonResponse(400, {
        error: "Notion API Key and Database ID are required. Please configure them in the deployment environment variables.",
      });
    }

    const { tasks } = parseJsonBody<{ tasks?: unknown }>(event);
    if (!Array.isArray(tasks)) {
      return jsonResponse(400, { error: "Tasks array is required" });
    }

    const notion = new Client({ auth: apiKey });
    const results: string[] = [];

    for (const item of tasks as NotionTask[]) {
      const name = typeof item.name === "string" && item.name.trim() ? item.name.trim() : "Untitled task";
      const description = typeof item.description === "string" && item.description.trim()
        ? item.description.trim()
        : "No description provided.";

      const response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: {
            title: [
              {
                text: { content: name },
              },
            ],
          },
        },
        children: [
          {
            object: "block",
            paragraph: {
              rich_text: [
                {
                  text: { content: description },
                },
              ],
            },
          },
        ],
      });
      results.push(response.id);
    }

    return jsonResponse(200, { success: true, count: results.length });
  } catch (error) {
    console.error("Notion sync error:", error);
    return jsonResponse(500, { error: getErrorMessage(error) });
  }
}
