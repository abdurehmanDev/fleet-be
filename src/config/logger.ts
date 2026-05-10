import pino from 'pino';
import env from './env';

const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      headers: req.headers,
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
    }),
  },
});

export default logger;
