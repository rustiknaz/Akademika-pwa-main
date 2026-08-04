import { db } from "./db";
import {
  messages,
  type Message,
  type InsertMessage,
} from "@shared/schema";

export interface IStorage {
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteProfile(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private memMessages: Message[] = [];
  private nextId = 1;

  async getMessages(): Promise<Message[]> {
    if (!db) {
      return this.memMessages;
    }
    try {
      return await db.select().from(messages);
    } catch (err) {
      console.warn("[AI Studio] Database read failed, using in-memory fallback:", err);
      return this.memMessages;
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const memMsg: Message = {
      id: this.nextId++,
      content: insertMessage.content,
      createdAt: new Date(),
    };
    this.memMessages.push(memMsg);

    if (!db) {
      return memMsg;
    }
    try {
      const [message] = await db
        .insert(messages)
        .values(insertMessage)
        .returning();
      return message;
    } catch (err) {
      console.warn("[AI Studio] Database insert failed, using in-memory fallback:", err);
      return memMsg;
    }
  }

  async deleteProfile(id: number): Promise<void> {
    console.log(`[AI Studio] deleteProfile called for id ${id} (no-op)`);
  }
}

export const storage = new DatabaseStorage();
