import type { Menu } from "@/domain/menu";
import { menuSchema } from "@/domain/schema";
import type { MenuRepository } from "../menu-repository";
import { seedMenu } from "./menu";

export class SeedMenuRepository implements MenuRepository {
  async getMenu(): Promise<Menu> {
    return menuSchema.parse(seedMenu);
  }
}
