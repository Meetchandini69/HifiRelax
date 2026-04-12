import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// CORS — configurable via CORS_ORIGINS env var (comma-separated list)
// e.g. CORS_ORIGINS=https://hifirelax.pages.dev,https://example.com
// Leave unset to allow all origins (open CORS — safe behind Railway auth)
const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // Allow all if no list is configured
      if (allowedOrigins.length === 0) return callback(null, true);
      // Check against configured list
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check — useful for Cloudflare / reverse proxy monitoring
app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

app.use("/api", router);

export default app;
