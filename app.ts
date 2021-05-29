import express from "express";
import cors from "cors";
import { logger } from "./src/utils/logger";
import { getDBConnection } from "./src/utils/db-connection";
import { config } from "dotenv";
import { RoutesController } from "./src/controller/routes.controller";
import TYPES from "./src/types/type";
import container from "./src/inversify.config";
import cookieParser from "cookie-parser";

const app: express.Application = express();
const port = process.env.PORT || 3000;
config();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
getDBConnection();

const controllers: RoutesController[] = container.getAll<RoutesController>(
  TYPES.Controller
);
controllers.forEach((controller) => controller.register(app));

app.use(function (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  logger.error(err);
  res.status(err.status || err.statusCode || 500).send(err);
});

process.on("unhandledRejection", (error: Error) => {
  console.log("unhandledRejection", error.message);
});

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
