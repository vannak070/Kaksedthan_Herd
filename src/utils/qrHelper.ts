import { useState, useEffect } from 'react';

let cachedLanIp: string | null = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_LAN_IP || null) : null;

/**
 * Resolves QR Code target URL automatically based on environment & Wi-Fi IP
 */
export function buildQrTargetUrl(queryPath: string, customIp?: string | null): string {
  const cleanPath = queryPath.startsWith('/') ? queryPath : `/${queryPath}`;

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const portSuffix = port ? `:${port}` : '';

    // If browser is ALREADY on a real LAN IP or production domain (not localhost/127.0.0.1)
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';

    if (!isLocalhost) {
      return `${protocol}//${hostname}${portSuffix}${cleanPath}`;
    }

    // If on localhost, use cached or provided LAN IP
    const activeLanIp = customIp || cachedLanIp || process.env.NEXT_PUBLIC_LAN_IP;
    if (activeLanIp && activeLanIp !== '127.0.0.1' && activeLanIp !== 'localhost') {
      return `${protocol}//${activeLanIp}${portSuffix}${cleanPath}`;
    }

    return `${window.location.origin}${cleanPath}`;
  }

  // SSR Fallback
  if (customIp || cachedLanIp) {
    return `http://${customIp || cachedLanIp}:3000${cleanPath}`;
  }

  return `http://localhost:3000${cleanPath}`;
}

/**
 * React Hook to dynamically detect host LAN IP and return scannable QR Code URL
 */
export function useQrCodeUrl(queryPath: string) {
  const [targetUrl, setTargetUrl] = useState<string>(() => buildQrTargetUrl(queryPath, cachedLanIp));
  const [lanIp, setLanIp] = useState<string | null>(cachedLanIp);
  const [isLoading, setIsLoading] = useState<boolean>(!cachedLanIp);

  useEffect(() => {
    let isMounted = true;

    async function detectNetworkIp() {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';

        // If opened directly via IP address or domain
        if (!isLocalhost) {
          const directUrl = `${window.location.protocol}//${window.location.host}${queryPath.startsWith('/') ? queryPath : `/${queryPath}`}`;
          if (isMounted) {
            setLanIp(hostname);
            setTargetUrl(directUrl);
            setIsLoading(false);
          }
          return;
        }
      }

      // Fetch active host LAN IP from system API
      try {
        const res = await fetch('/api/v1/system/network-info');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.ip) {
            const detectedIp = json.data.ip;
            cachedLanIp = detectedIp;
            if (isMounted) {
              setLanIp(detectedIp);
              setTargetUrl(buildQrTargetUrl(queryPath, detectedIp));
            }
          }
        }
      } catch (err) {
        console.warn('[QR Helper] LAN IP auto-detection error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    detectNetworkIp();

    return () => {
      isMounted = false;
    };
  }, [queryPath]);

  return { targetUrl, lanIp, isLoading };
}

/**
 * Helper to build QR Code Image src URL (via qrserver API)
 */
export function getQrCodeImageUrl(url: string, size = 160): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}
