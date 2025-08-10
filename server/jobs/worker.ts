import { storage } from "../storage";
import { markJobStatus } from "./queue";
import { AIAnalyzer } from "../services/aiAnalyzer";

const ai = new AIAnalyzer();

export async function startWorker() {
  console.log("🔄 Job worker started");
  setInterval(async () => {
    // For now, skip job processing since storage methods don't exist yet
    // const job = await storage.takeNextQueuedJob();
    const job = null;
    if (!job) return;
    try {
      await markJobStatus(job.id, "processing");
      let result: any = null;

      if (job.type === "ai.analyze") {
        const { title, content, platform } = job.payload;
        result = await ai.analyzeContent(title, content, platform);
      }
      // add other job types here...

      await markJobStatus(job.id, "done", result);
    } catch (err) {
      await markJobStatus(job.id, "failed", { message: (err as Error).message });
    }
  }, 2000);
}