import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { seedMenu } from "../src/data/seed/menu";
import { buildSeedSql } from "../src/data/supabase/seed-sql";

const target = resolve(process.cwd(), "supabase/seed.sql");
writeFileSync(target, buildSeedSql(seedMenu), "utf8");
console.log(`seed.sql gerado em ${target} (não aplique em projeto remoto sem autorização)`);
