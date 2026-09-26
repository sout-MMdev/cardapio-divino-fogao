import { z } from "zod";

const envSchema = z.discriminatedUnion("MENU_SOURCE", [
  z.object({ MENU_SOURCE: z.literal("seed") }),
  z.object({
    MENU_SOURCE: z.literal("supabase"),
    SUPABASE_URL: z.url(),
    SUPABASE_ANON_KEY: z.string().min(1),
  }),
]);
export type Env = z.infer<typeof envSchema>;

export function readEnv(source: Record<string, string | undefined> = process.env): Env {
  return envSchema.parse({ ...source, MENU_SOURCE: source.MENU_SOURCE || "seed" });
}
