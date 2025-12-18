import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { RunController } from "./controllers/runController";
import { AiController } from "./controllers/aiController";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Rate Limiter: 50 req/min for execution, 20 req/min for AI
  const runLimiter = rateLimit({ windowMs: 60 * 1000, max: 50 });
  const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

  // 1. EXECUTION API
  app.post("/run/:language", runLimiter, RunController.execute);

  // Legacy compatibility
  app.post("/api/execute", runLimiter, async (req, res) => {
    req.params.language = req.body.language;
    await RunController.execute(req, res);
  });

  // 2. AI ASSISTANT API
  app.post("/ai/ask", aiLimiter, AiController.ask);

  // Legacy compatibility for Chat
  app.post("/api/chat", aiLimiter, async (req, res) => {
    // Map old 'message' field to new 'question' field
    req.body.question = req.body.message;

    // Adapt response format: { answer: ... } -> { response: ... }
    const originalJson = res.json;
    res.json = function (data) {
      if (data.answer) {
        data.response = data.answer;
      }
      return originalJson.call(this, data);
    };

    await AiController.ask(req, res);
  });

  return httpServer;
}
