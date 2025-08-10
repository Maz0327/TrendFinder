import { takeNextQueued, markDone, markFailed } from "./inMemoryQueue";
import { AIAnalyzer } from "../services/aiAnalyzer";

const ai = new AIAnalyzer();

export function startWorker() {
  setInterval(async () => {
    const job = takeNextQueued();
    if (!job) return;

    try {
      if (job.type === "ai.analyze") {
        const { title, content, platform } = job.payload;
        const result = await ai.analyzeContent(title, content, platform);
        markDone(job.id, result);
      } else {
        markFailed(job.id, `Unknown job type: ${job.type}`);
      }
    } catch (err: any) {
      markFailed(job.id, err?.message || "Job failed");
    }
  }, 1000);
}