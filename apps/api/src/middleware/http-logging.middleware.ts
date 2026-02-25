import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { normalizeIp } from '../utils/client-ip';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
    use(req: Request & { clientIp?: string }, res: Response, next: NextFunction) {
        const userAgent = req?.headers['user-agent'] || '';

        const userIp =
            req?.headers?.['cf-connecting-ip']?.toString() ||
            req.clientIp?.toString() ||
            req.ip ||
            '';

        if (req?.originalUrl.includes('health')) {
            next();
            return;
        }

        console.log(`Request started for: ${req?.method} ${req?.originalUrl}`, {
            http: {
                method: req?.method,
                url: req?.originalUrl,
                user_agent: userAgent,
            },
            client: { ip: normalizeIp(userIp) },
            timestamp: new Date().toISOString(),
        });

        const startTime = Date.now();

        res.on('finish', () => {
            const responseTime = Date.now() - startTime;
            const { statusCode } = res;

            const meta = {
                http: {
                    method: req?.method,
                    url: req?.originalUrl,
                    status_code: statusCode,
                    response_time_ms: responseTime,
                },
                client: { ip: normalizeIp(userIp) },
                performance: { response_time_ms: responseTime },
                timestamp: new Date().toISOString(),
            };

            if (statusCode >= 500) {
                console.error(
                    `Request finished with error: ${req?.method} ${req?.originalUrl} ${statusCode}`,
                    meta,
                );
            } else if (statusCode >= 400) {
                console.warn(
                    `Request finished with error: ${req?.method} ${req?.originalUrl} ${statusCode}`,
                    meta,
                );
            } else {
                console.log(
                    `Request finished for: ${req?.method} ${req?.originalUrl} ${statusCode}`,
                    meta,
                );
            }
        });

        next();
    }
}
