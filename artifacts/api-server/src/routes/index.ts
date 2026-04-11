import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { authRouter } from "./classifieds/auth.js";
import { locationsRouter } from "./classifieds/locations.js";
import { profilesRouter } from "./classifieds/profiles.js";
import { settingsRouter } from "./classifieds/settings.js";
import { boostsRouter } from "./classifieds/boosts.js";
import { pageContentRouter } from "./classifieds/pageContent.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/classifieds/auth", authRouter);
router.use("/classifieds/locations", locationsRouter);
router.use("/classifieds/profiles", profilesRouter);
router.use("/classifieds/settings", settingsRouter);
router.use("/classifieds/boosts", boostsRouter);
router.use("/classifieds/page-content", pageContentRouter);

export default router;
