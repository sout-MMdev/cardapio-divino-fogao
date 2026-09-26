import { menuSchema, type Menu } from "@/domain/menu";
import type { MenuRepository } from "../menu-repository";
import { seedMenu } from "./menu";

export class SeedMenuRepository implements MenuRepository {
  async getMenu(): Promise<Menu> {
    return menuSchema.parse(seedMenu);
  }
}
