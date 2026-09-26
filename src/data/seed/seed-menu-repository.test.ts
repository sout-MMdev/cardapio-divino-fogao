import { describeMenuRepositoryContract } from "../menu-repository.contract";
import { SeedMenuRepository } from "./seed-menu-repository";

describeMenuRepositoryContract("SeedMenuRepository", () => new SeedMenuRepository());
