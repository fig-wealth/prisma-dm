import path from "path";
import fs from "fs-extra";
import { CONFIG_FILE_NAME } from "../config/CONFIG_FILE_NAME";
import { getConfig } from "../config/getConfig";
import { DEFAULT_CONFIG } from "../config/DEFAULT_CONFIG";
import { Validator } from "./Validator";
import { PrismaCLI } from "../utils/classes/PrismaCLI";
import { updateOrAddOutputInSchema } from "../utils/updateOrAddOutputInSchema";
import { TargetedPrismaMigrator } from "./TargetedPrismaMigrator";
import { ScriptRunner } from "./ScriptRunner";
import { DB } from "./DB";
import { Logger } from "./Logger";
import { MigrationModel } from "../types/MigrationModel";

export class CLI<T extends string> {
  constructor(
    private readonly migrator: TargetedPrismaMigrator<T>,
    private readonly scriptRunner: ScriptRunner,
    private readonly db: DB,
    private readonly validator: Validator,
    private readonly logger: Logger
  ) {}

  static init() {
    const configFilePath = path.join(process.cwd(), CONFIG_FILE_NAME);

    if (fs.existsSync(configFilePath)) {
      throw new Error("Config file already exists");
    }

    fs.writeFileSync(configFilePath, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }

  generate() {
    const config = getConfig();
    const migrationsDirPath = path.join(process.cwd(), config.migrationsDir);
    const migrationsDir = fs.readdirSync(migrationsDirPath);

    for (const migrationName of migrationsDir) {
      if (this.validator.isDataMigration(migrationName)) {
        const migrationPath = path.join(migrationsDirPath, migrationName);
        const schemaPath = path.join(migrationPath, "schema.prisma");
        const outputPath = `${config.outputDir}/${migrationName}`;

        this.logger.logMessage(
          `Generating types for migration: ${migrationName}`
        );
        updateOrAddOutputInSchema(schemaPath, outputPath);
        PrismaCLI.generate({ schema: schemaPath });
      }
    }
  }

  async migrate({ to }: { to?: T | undefined } = {}) {
    if (to) {
      this.validator.validateMigrationName(to);
    }

    const config = getConfig();
    const migrationsDirPath = path.join(process.cwd(), config.migrationsDir);
    const rawMigrations = fs
      .readdirSync(migrationsDirPath)
      .filter((m) => this.validator.isMigration(m));
    const lastMigrationIndex = to
      ? rawMigrations.indexOf(to)
      : rawMigrations.length;
    const migrations = rawMigrations.slice(0, lastMigrationIndex);
    const dataMigrations = migrations.filter((m) =>
      this.validator.isDataMigration(m)
    );
    await this.db.connect();

    for (const migrationName of dataMigrations) {
      const prismaTableExists = await this.db.isPrismaMigrationsTableExists();
      let migration: MigrationModel | null = null;

      if (prismaTableExists) {
        migration = await this.db.getMigrationByName(migrationName);
      }

      const migrationAppliedCount = prismaTableExists
        ? migration?.applied_steps_count ?? 0
        : 0;

      await this.migrator.migrateTo(migrationName as T);
      const newMigration = await this.db.getMigrationByName(migrationName);
      const newMigrationAppliedCount = newMigration?.applied_steps_count ?? 0;

      if (migrationAppliedCount + 1 === newMigrationAppliedCount) {
        this.logger.logMessage(
          `Executing post-migrate script for migration: ${migrationName}`
        );
        this.scriptRunner.run(
          path.resolve(config.migrationsDir, migrationName, "post")
        );
      }
    }

    if (dataMigrations.at(-1) !== migrations.at(-1)) {
      await this.migrator.migrateTo(migrations.at(-1) as T);
    }

    await this.db.disconnect();
  }
}
