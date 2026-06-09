import { Client } from "@notionhq/client";
import { getErrorMessage, requirePost, type JsonRequest, type JsonResponse } from "../../src/server/api";

type NotionTask = {
  name?: unknown;
  description?: unknown;
};

export default async function handler(req: JsonRequest, res: JsonResponse) {
  if (!requirePost(req, res)) return;

  try {
    const apiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!apiKey || !databaseId) {
      res.status(400).json({ error: "Notion API Key and Database ID are required. Please configure them in the deployment environment variables." });
      return;
    }

    const { tasks } = req.body as { tasks?: unknown };
    if (!Array.isArray(tasks)) {
      res.status(400).json({ error: "Tasks array is required" });
      return;
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

    res.status(200).json({ success: true, count: results.length });
  } catch (error) {
    console.error("Notion sync error:", error);
    res.status(500).json({ error: getErrorMessage(error) });
  }
}
