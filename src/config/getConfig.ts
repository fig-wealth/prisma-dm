import path from "path";
import fs from "fs-extra";
import { ConfigSchema } from "./config.type";
import { CONFIG_FILE_NAME } from "./CONFIG_FILE_NAME";
import schema from "../../config.schema.json";
import Ajv from "ajv";

export function getConfig(): ConfigSchema {
  try {
    const configFilePath = path.join(process.cwd(), CONFIG_FILE_NAME);
    const file = fs.readFileSync(configFilePath, "utf-8");
    const config = JSON.parse(file);

    const ajv = new Ajv();
    const validate = ajv.compile(schema);

    if (!validate(config)) {
      console.error("Invalid configuration file:", validate.errors);
      throw new Error("Configuration validation failed.");
    }

    const typedConfig = config as ConfigSchema;

    return {
      migrationsDir: path.join(process.cwd(), typedConfig.migrationsDir),
      tempDir: path.join(process.cwd(), typedConfig.tempDir),
      ...typedConfig,
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        "Config file not found. Run `npx prisma-dm init` to create one."
      );
    }

    throw error;
  }
}
