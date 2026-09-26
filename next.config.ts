import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const supabaseHost = process.env.SUPABASE_URL
  ? new URL(process.env.SUPABASE_URL).hostname
  : undefined;

/**
 * Cabeçalhos básicos de segurança. Sem X-Frame-Options/frame-ancestors de propósito:
 * o Mobile Viewer do VS Code exibe o app dentro de um iframe, e o cardápio não tem ações
 * sensíveis que justifiquem bloquear o enquadramento. CSP estrita fica para o deploy.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withSerwist(nextConfig);
