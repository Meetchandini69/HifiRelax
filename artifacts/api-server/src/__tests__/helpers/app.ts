import express from "express";
import { authRouter } from "../../routes/classifieds/auth.js";
import { profilesRouter } from "../../routes/classifieds/profiles.js";
import { pageContentRouter } from "../../routes/classifieds/pageContent.js";
import { settingsRouter } from "../../routes/classifieds/settings.js";

export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/classifieds/auth", authRouter);
  app.use("/api/classifieds/profiles", profilesRouter);
  app.use("/api/classifieds/page-content", pageContentRouter);
  app.use("/api/classifieds/settings", settingsRouter);
  return app;
}
