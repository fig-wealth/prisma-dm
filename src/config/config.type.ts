export type Config = {
  log: "none" | "info" | "verbose";
  execScriptCommand: string;
  migrationsDir: string;
  outputDir: string;
  tempDir: string;
};
