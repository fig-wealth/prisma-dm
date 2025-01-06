import { Config } from "../types/config";

export const DEFAULT_CONFIG: Config = {
  // $schema:
  // "https://raw.githubusercontent.com/username/my-library/main/my-library.schema.json",
  migrationsDir: "prisma/migrations",
  tempDir: "prisma/.temp",
  log: true,
};
