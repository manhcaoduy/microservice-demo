import { utilities } from 'nest-winston';
import * as winston from 'winston';
import { format, transports as winstonTransports } from 'winston';
import { FATAL_TAG, LOG_SEPARATOR } from './gcp-logger';

export function createLoggerTransports(local: boolean, serviceName: string) {
  if (local) {
    return [
      new winstonTransports.Console({
        format: format.combine(
          stringLogFormat(),
          format.timestamp(),
          format.ms(),
          utilities.format.nestLike(serviceName, {
            colors: true,
            prettyPrint: false,
            processId: false,
          }),
        ),
      }),
    ];
  }

  return [
    new winstonTransports.Console({
      format: format.combine(
        jsonLogFormat(),
        format.timestamp(),
        format.ms(),
        severityFormat(),
        format.json({ deterministic: false }),
      ),
    }),
  ];
}

export const stringLogFormat = winston.format((info) => {
  if (info.message && typeof info.message === 'string') {
    info.message = info.message.split(LOG_SEPARATOR).join(' - ');
  }
  return info;
});

export const jsonLogFormat = winston.format((info) => {
  if (info.message && typeof info.message === 'string') {
    try {
      const [message, payload] = info.message.split(LOG_SEPARATOR);
      if (payload) {
        info.payload = JSON.parse(payload);
        info.message = message;
      }
    } catch (error) {}
  }
  return info;
});

export const severityFormat = winston.format((info) => {
  if (!info.level) {
    info.severity = 'INFO';
  } else {
    info.severity = info.level.toUpperCase();
    // @ts-ignore
    info.level = undefined;
  }
  if (
    typeof info.message === 'string' &&
    info.severity === 'ERROR' &&
    info.message.startsWith(`${FATAL_TAG} `)
  ) {
    info.severity = 'CRITICAL';
    info.message = info.message.slice(`${FATAL_TAG} `.length);
  }

  return info;
});
