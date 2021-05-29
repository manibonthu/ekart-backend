import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  transports: [
    new transports.Console({
      level: "info",
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.Console({
      level: "debug",
      format: format.combine(format.colorize(), format.simple()),
    }),

    new transports.File({ filename: "error.log" }),
  ],
  exitOnError: false,
});
