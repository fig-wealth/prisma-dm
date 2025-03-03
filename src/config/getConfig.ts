import path from "path";
import fs from "fs-extra";
import { ConfigSchema } from "./config.type";
import { CONFIG_FILE_NAME } from "./CONFIG_FILE_NAME";
import schema from "../../config.schema.json";
import Ajv from "ajv";
import {DEFAULT_CONFIG} from "./DEFAULT_CONFIG";

export function getConfig(): ConfigSchema {
  try {
    const configFilePath = path.join(process.cwd(), CONFIG_FILE_NAME);
    let parsedConfig = {};
    try {
      const file = fs.readFileSync(configFilePath, "utf-8");
      parsedConfig = JSON.parse(file);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.info(`No config file ${CONFIG_FILE_NAME} found, using defaults`)
      }else {
        throw new Error(
          "Could not read config file"
        );
      }
    }
    const config: ConfigSchema = {
      ...DEFAULT_CONFIG,
      ...parsedConfig
    };

    const ajv = new Ajv();
    const validate = ajv.compile(schema);

    if (!validate(config)) {
      console.error("Invalid configuration file:", validate.errors);
      throw new Error("Configuration validation failed.");
    }

    return {
      migrationsDir: path.join(process.cwd(), config.migrationsDir),
      tempDir: path.join(process.cwd(), config.tempDir),
      ...config,
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
