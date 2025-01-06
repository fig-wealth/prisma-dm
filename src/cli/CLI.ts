import path from "path";
import fs from "fs-extra";
import { CONFIG_FILE_NAME } from "../constants/CONFIG_FILE_NAME";
import { getConfig } from "../utils/getConfig";
import { DEFAULT_CONFIG } from "../constants/DEFAULT_CONFIG";
import { Validator } from "../utils/Validator";
import { PrismaCLI } from "./PrismaCLI";
import { updateOrAddOutputInSchema } from "../utils/updateOrAddOutputInSchema";

export class CLI {
  init() {
    const configFilePath = path.join(process.cwd(), CONFIG_FILE_NAME);

    if (fs.existsSync(configFilePath)) {
      console.error("Config file already exists");
      process.exit(1);
    }

    fs.writeFileSync(configFilePath, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }

  generate() {
    const config = getConfig();
    const migrationsDirPath = path.join(process.cwd(), config.migrationsDir);
    const migrationsDir = fs.readdirSync(migrationsDirPath);

    for (const migrationName of migrationsDir) {
      const migrationPath = path.join(migrationsDirPath, migrationName);

      if (Validator.isDataMigrationDir(migrationPath)) {
        const schemaPath = path.join(migrationPath, "schema.prisma");
        const outputPath = `${config.outputDir}/${migrationName}`;

        console.log(`Generating types for migration: ${migrationName}`);
        updateOrAddOutputInSchema(schemaPath, outputPath);
        PrismaCLI.generate({ schema: schemaPath });
      }
    }
  }
}
