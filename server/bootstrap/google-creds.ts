// server/bootstrap/google-creds.ts
import fs from "node:fs";

const b64 = process.env.GCP_SA_KEY_JSON_B64;

// Only write once, and only if not already set
if (b64 && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const json = Buffer.from(b64, "base64").toString("utf8");
    const path = "/tmp/gcp-sa.json";
    fs.writeFileSync(path, json, { encoding: "utf8" });
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path;
    console.log(
      "[google-creds] Wrote /tmp/gcp-sa.json and set GOOGLE_APPLICATION_CREDENTIALS",
    );
  } catch (err) {
    console.error("[google-creds] Failed to write creds:", err);
  }
} else {
  if (!b64) console.warn("[google-creds] GCP_SA_KEY_JSON_B64 not set");
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("[google-creds] GOOGLE_APPLICATION_CREDENTIALS already set");
  }
}
