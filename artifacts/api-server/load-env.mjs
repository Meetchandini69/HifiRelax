/**
 * load-env.mjs — Cross-platform .env loader using ONLY Node.js built-ins.
 * No dotenv package required. Works on Windows, Mac, Linux.
 *
 * Run via: node --import=./load-env.mjs ./dist/index.mjs
 *
 * Reads .env files from (first match wins, later files do NOT overwrite):
 *   1. <project-root>/.env          (../../.env from artifacts/api-server)
 *   2. <api-server-dir>/.env        (local fallback)
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const here        = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "..", "..");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key   = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(projectRoot, ".env"));   // ../../.env  (project root)
loadEnvFile(resolve(here, ".env"));          // artifacts/api-server/.env
