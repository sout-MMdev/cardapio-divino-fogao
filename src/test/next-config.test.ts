import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("next.config — o que o servidor revela", () => {
  it("não anuncia a tecnologia no cabeçalho X-Powered-By", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("envia cabeçalhos básicos de segurança em todas as rotas", async () => {
    const rules = (await nextConfig.headers?.()) ?? [];
    const all = rules.find((r) => r.source === "/:path*")?.headers ?? [];
    const byKey = Object.fromEntries(all.map((h) => [h.key, h.value]));
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["Permissions-Policy"]).toBe("camera=(), microphone=(), geolocation=()");
  });
});
