// Chạy indexer như process riêng: npm run indexer
import { runIndexerLoop, stopIndexer } from "./indexer.js";
import { prisma } from "../db.js";

const shutdown = async () => {
  stopIndexer();
  await prisma.$disconnect();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await runIndexerLoop();
