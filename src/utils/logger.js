const { createLogger, format, transports } = require("winston");

const isProduction = process.env.NODE_ENV === "production";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console(),

    // Only use file logging locally
    ...(!isProduction
      ? [
          new transports.File({
            filename: "logs/error.log",
            level: "error"
          }),
          new transports.File({
            filename: "logs/app.log"
          })
        ]
      : [])
  ]
});

module.exports = logger;