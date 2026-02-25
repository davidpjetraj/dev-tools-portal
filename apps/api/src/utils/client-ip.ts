import { Request } from 'express';

export const getClientIp = (req: Request & { clientIp?: string }): string => {
    const userIp =
        req?.headers?.['cf-connecting-ip']?.toString() ||
        req?.clientIp?.toString() ||
        req?.ip ||
        '';
    return normalizeIp(userIp);
};

export const normalizeIp = (ip?: string): string => {
    if (!ip) return '';
    // Strip IPv6-mapped IPv4 prefix
    if (ip.startsWith('::ffff:')) {
        return ip.replace('::ffff:', '');
    }
    return ip;
};
