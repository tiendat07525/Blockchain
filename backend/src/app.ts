import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { config } from "./config.js";
import { api, health } from "./routes/api.js";
import { HttpError } from "./lib/format.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get("/health", async (_req, res) => {
    try {
      res.json(await health());
    } catch (e) {
      res.status(503).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  });

  app.use("/api", api);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Express 5 tự chuyển lỗi của async handler tới đây
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
