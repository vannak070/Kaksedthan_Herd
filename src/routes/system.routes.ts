import { Router, Request, Response } from 'express';
import os from 'os';

const router = Router();

/**
 * Detect local IPv4 network address of host machine
 */
export function getLocalNetworkIp(): string {
  // 1. Environment variables take precedence if specified
  if (process.env.NEXT_PUBLIC_LAN_IP) return process.env.NEXT_PUBLIC_LAN_IP;
  if (process.env.LAN_IP) return process.env.LAN_IP;

  // 2. Scan OS network interfaces
  const interfaces = os.networkInterfaces();
  let fallbackIp = '127.0.0.1';

  for (const name of Object.keys(interfaces)) {
    const ifaceList = interfaces[name];
    if (!ifaceList) continue;

    for (const iface of ifaceList) {
      if (iface.internal || iface.family !== 'IPv4') continue;

      const ip = iface.address;
      // Prefer standard LAN IP ranges (192.168.x.x, 10.x.x.x)
      if (ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return ip;
      }
      if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) && !ip.endsWith('.1')) {
        fallbackIp = ip;
      }
    }
  }

  return fallbackIp;
}

/**
 * GET /api/v1/system/network-info
 * Returns system network IP and environment configuration for QR codes
 */
router.get('/network-info', (req: Request, res: Response) => {
  const ip = getLocalNetworkIp();
  const port = process.env.FRONTEND_PORT || '3000';
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production' && !ip.startsWith('192.168.') && !ip.startsWith('10.') && ip !== '127.0.0.1';

  res.json({
    success: true,
    data: {
      ip,
      port,
      appUrl: isProduction ? (process.env.NEXT_PUBLIC_APP_URL || `http://${ip}:${port}`) : `http://${ip}:${port}`,
      isProduction,
      nodeEnv
    }
  });
});

export default router;
