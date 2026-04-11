import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// CORS — configurable via CORS_ORIGINS env var
// Set CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
// or leave unset to allow all origins (open CORS)
const rawOrigins = process.env.CORS_ORIGINS;
const corsOptions = rawOrigins
  ? {
      origin: rawOrigins.split(",").map((o) => o.trim()),
      credentials: true,
    }
  : { origin: true, credentials: true };

app.use(cors(corsOptions));

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
