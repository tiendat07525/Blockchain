import { config } from "./config.js";
import { createApp } from "./app.js";
import { prisma } from "./db.js";
import { runIndexerLoop, stopIndexer } from "./indexer/indexer.js";

const server = createApp().listen(config.port, () => {
  console.log(`[api] http://localhost:${config.port}  (CORS: ${config.corsOrigin.join(", ")})`);
});

if (config.runIndexer) {
  void runIndexerLoop();
}

const shutdown = () => {
  stopIndexer();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
