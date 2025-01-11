import { Config } from "./config.type";

export const DEFAULT_CONFIG: Config = {
  // $schema:
  // "https://raw.githubusercontent.com/username/my-library/main/my-library.schema.json",
  execScriptCommand: "tsx ${post}.ts",
  outputDir: "../../../node_modules/prisma-data-migrations/migrations",
  migrationsDir: "prisma/migrations",
  tempDir: "prisma/.temp",
  log: "info",
};
