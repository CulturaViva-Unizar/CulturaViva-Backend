const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize(),
    format.printf(({ level, message, timestamp, ...meta }) => {
      const metaStr = meta[Symbol.for('splat')]
        ? JSON.stringify(meta[Symbol.for('splat')][0])
        : '';
      return `[${timestamp}] ${level}: ${message} ${metaStr}`;
    })
  ),
  transports: [
    new transports.Console(),

    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxFiles: '14d',
      maxSize: '20m',
    }),

    new DailyRotateFile({
      filename: 'logs/warning-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'warn',
      zippedArchive: true,
      maxFiles: '14d',
      maxSize: '20m',
    }),

    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14d',
      maxSize: '20m',
    }),
  ],
});

module.exports = logger;
