import express from "express";
import { WaterDate } from "../middlewares/waterMidellwares.js";

import { joiValidateDataMiddleware } from "../helpers/validateBody.js";

import {
  createWaterSchema,
  updateWaterSchema,
} from "../schemas/waterSchema.js";

import {
  createWater,
  deleteWater,
  updateWater,
  getDayWater,
  getMonthWater,
} from "../controllers/waterService.js";

import { auth } from "../middlewares/authenticate.js";

const waterRouter = express.Router();

waterRouter.post(
  "/",
  joiValidateDataMiddleware(createWaterSchema),
  auth,
  createWater
);

waterRouter.delete("/:id", auth, deleteWater);

waterRouter.put(
  "/:id",
  joiValidateDataMiddleware(updateWaterSchema),
  auth,
  updateWater
);
waterRouter.get("/day/:date", WaterDate, auth, getDayWater);
waterRouter.get("/month/:date", WaterDate, auth, getMonthWater);

export default waterRouter;
