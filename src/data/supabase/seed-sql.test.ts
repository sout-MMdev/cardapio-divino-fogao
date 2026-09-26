import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { cents } from "@/domain/money";
import { makeCategory, makeDish, makeMenu } from "@/test/fixtures";
import { seedMenu } from "../seed/menu";
import { buildSeedSql } from "./seed-sql";

describe("buildSeedSql", () => {
  it("gera inserts com aspas escapadas, numeric em reais e arrays vazios", () => {
    const sql = buildSeedSql(
      makeMenu({
        categories: [
          makeCategory({
            dishes: [
              makeDish({
                name: "Pão d'água",
                variants: [{ label: "Grande", price: cents(4290) }],
                photo: { src: "/menu-photos/x.jpg", alt: "x" },
              }),
            ],
          }),
        ],
      }),
    );
    expect(sql).toContain("truncate table public.promotions");
    expect(sql).toContain("'Pão d''água'");
    expect(sql).toContain("29.90");
    expect(sql).toContain("'Grande', 42.90");
    expect(sql).toContain("'x.jpg'");
    expect(sql).toContain("'{}'::text[]");
    expect(sql.trimEnd().endsWith("commit;")).toBe(true);
  });

  it("supabase/seed.sql está em dia com src/data/seed/menu.ts (rode npm run seed:sql)", () => {
    const onDisk = readFileSync(resolve(process.cwd(), "supabase/seed.sql"), "utf8").replace(
      /\r\n/g,
      "\n",
    );
    expect(onDisk).toBe(buildSeedSql(seedMenu));
  });
});
