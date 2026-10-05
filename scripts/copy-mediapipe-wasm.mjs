// Copies the MediaPipe Tasks Vision WASM runtime into public/ so it is served
// same-origin instead of from a third-party CDN at runtime.
import { existsSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(fileURLToPath(new URL("..", import.meta.url)));
const srcDir = path.join(rootDir, "node_modules", "@mediapipe", "tasks-vision", "wasm");
const destDir = path.join(rootDir, "public", "mediapipe", "wasm");

if (!existsSync(srcDir)) {
  console.warn("[copy-mediapipe-wasm] source not found, skipping:", srcDir);
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });

for (const file of readdirSync(srcDir)) {
  if (file.endsWith(".wasm") || file.endsWith(".js")) {
    copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  }
}

console.log("[copy-mediapipe-wasm] synced WASM runtime to public/mediapipe/wasm");
