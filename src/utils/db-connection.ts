import { connect } from "mongoose";
import { logger } from "./logger";

export const getDBConnection = () => {
  const DB_URI = process.env.DB_URI || "";
  logger.debug(DB_URI);
  connect(DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
    .then(() => {
      logger.info("connected to DB..");
    })
    .catch((e) => {
      logger.error(e.message);
    });
};
