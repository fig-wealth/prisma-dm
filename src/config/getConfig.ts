import path from "path";
import fs from "fs-extra";
import { Config } from "./config.type";
import { CONFIG_FILE_NAME } from "./CONFIG_FILE_NAME";

export function getConfig(): Config {
  try {
    const configFilePath = path.join(process.cwd(), CONFIG_FILE_NAME);
    const file = fs.readFileSync(configFilePath, "utf-8");
    const config = JSON.parse(file);

    return {
      migrationsDir: path.join(process.cwd(), config.migrationsDir),
      tempDir: path.join(process.cwd(), config.tempDir),
      ...config,
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        "Config file not found. Run `npx prisma-dm init` to create one."
      );
    }
  }
}
