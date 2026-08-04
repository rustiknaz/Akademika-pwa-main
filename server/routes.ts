import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { sql } from "drizzle-orm";

async function logActivity(profileId: string | number, type: string, desc: string, amount: number = 0) {
  try {
    await db.execute(sql`
      INSERT INTO activity_logs (profile_id, action_type, description, amount)
      VALUES (${profileId}, ${type}, ${desc}, ${amount})
    `);
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram credentials missing, skipping message");
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Telegram API error:", errorData);
    }
  } catch (err) {
    console.error("Failed to send telegram message:", err);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/notifications/telegram", async (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }
    await sendTelegramMessage(text);
    res.json({ success: true });
  });

  app.get(api.messages.list.path, async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  await seedDatabase();
  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getMessages();
  if (existing.length === 0) {
    await storage.createMessage({ content: "Welcome to the Replit App!" });
    await storage.createMessage({ content: "This is a fullstack React + Express application." });
    await storage.createMessage({ content: "Try adding your own message below." });
  }
}
