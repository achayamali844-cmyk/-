import express from 'express';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import path from 'path';
import type { GeminiModel } from './src/config/models';
import {
  createChatResponseTextStream,
  extractTasksFromChatServer,
  verifyStudyCheckInServer,
} from './src/services/aiCore';
import type { ChatMessage } from './src/services/aiTypes';

dotenv.config({ path: '.env.local' });
dotenv.config();

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown server error';
}

function isChatMessageList(value: unknown): value is ChatMessage[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const message = item as Partial<ChatMessage>;
    return typeof message.id === 'string'
      && (message.role === 'user' || message.role === 'model')
      && typeof message.text === 'string';
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  app.post('/api/ai/extract-tasks', async (req, res) => {
    try {
      const { messages, modelName } = req.body as { messages?: unknown; modelName?: GeminiModel };
      if (!isChatMessageList(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      const tasks = await extractTasksFromChatServer(messages, modelName);
      res.status(200).json({ tasks });
    } catch (error) {
      console.error('Task extraction error:', error);
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  app.post('/api/ai/verify-check-in', async (req, res) => {
    try {
      const { subject, taskDescription, userSummary, modelName } = req.body as {
        subject?: unknown;
        taskDescription?: unknown;
        userSummary?: unknown;
        modelName?: GeminiModel;
      };

      if (typeof subject !== 'string' || typeof taskDescription !== 'string' || typeof userSummary !== 'string') {
        return res.status(400).json({ error: 'subject, taskDescription, and userSummary are required' });
      }

      const result = await verifyStudyCheckInServer(subject, taskDescription, userSummary, modelName);
      res.status(200).json({ result });
    } catch (error) {
      console.error('Study check-in verification error:', error);
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  app.post('/api/ai/chat-stream', async (req, res) => {
    try {
      const { messages, systemInstruction, modelName } = req.body as {
        messages?: unknown;
        systemInstruction?: unknown;
        modelName?: GeminiModel;
      };

      if (!isChatMessageList(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      const textStream = await createChatResponseTextStream(
        messages,
        typeof systemInstruction === 'string' ? systemInstruction : undefined,
        modelName
      );

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');

      for await (const chunk of textStream) {
        res.write(chunk);
      }
      res.end();
    } catch (error) {
      console.error('Chat stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: getErrorMessage(error) });
        return;
      }
      res.end();
    }
  });

  // API Route for syncing to Notion
  app.post('/api/notion/sync', async (req, res) => {
    try {
      const apiKey = process.env.NOTION_API_KEY;
      const databaseId = process.env.NOTION_DATABASE_ID;

      if (!apiKey || !databaseId) {
        return res.status(400).json({ error: 'Notion API Key and Database ID are required. Please configure them in the Secrets menu.' });
      }

      const notion = new Client({ auth: apiKey });
      const { tasks, title } = req.body;

      if (!tasks || !Array.isArray(tasks)) {
        return res.status(400).json({ error: 'Tasks array is required' });
      }

      const results = [];
      for (const task of tasks) {
        const response = await notion.pages.create({
          parent: { database_id: databaseId },
          properties: {
            // Assumes a Notion database with specific properties.
            // A basic layout has at least "Name" (title type).
            // We use generic structures here.
            Name: {
              title: [
                {
                  text: {
                    content: task.name,
                  },
                },
              ],
            },
            // If user has a description, add it to 'Description' or inside page content
          },
          children: [
            {
              object: 'block',
              paragraph: {
                rich_text: [
                  {
                    text: {
                      content: task.description || 'No description provided.',
                    },
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
      console.error('Notion sync error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error during Notion sync' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
