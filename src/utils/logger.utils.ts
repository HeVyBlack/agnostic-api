import { createLogger, transports, format, Logger, Logform } from "winston";
import Format = Logform.Format;

import { EnvUtils as Env } from "./env.utils.ts";

const { printf, timestamp, combine } = format;

const customFormat: Format = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level.toLocaleUpperCase()}:\n${message}\n`;
});

const isProduction: boolean = Env["NODE_ENV"] === "production";

export const LogUtils: Logger = createLogger({
  format: combine(timestamp(), customFormat),
  transports: isProduction
    ? [
        new transports.Console(),
        new transports.File({
          dirname: "logs",
          filename: "info.log",
          level: "info",
        }),
        new transports.File({
          dirname: "logs",
          filename: "errors.log",
          level: "error",
        }),
      ]
    : [new transports.Console()],
});
