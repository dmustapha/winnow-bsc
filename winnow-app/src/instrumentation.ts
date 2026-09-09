// File: src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.WORKER !== "off") {
    const { startWorker } = await import("./worker");
    startWorker();
  }
}
