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
import { PrismaService } from "./PrismaService";
import { Logger } from "./Logger";

export class CLI<T extends string> {
  constructor(
    private readonly migrator: TargetedPrismaMigrator<T>,
    private readonly scriptRunner: ScriptRunner,
    private readonly prisma: PrismaService,
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

  async migrate({ to }: { to: T }) {
    this.validator.validateMigrationName(to);
    const config = getConfig();
    const migrationsDirPath = path.join(process.cwd(), config.migrationsDir);
    const rawMigrations = fs.readdirSync(migrationsDirPath);
    const migrations = rawMigrations.filter((m) =>
      this.validator.isMigration(m)
    );
    const dataMigrations = migrations.filter((m) => {
      return this.validator.isDataMigration(m);
    });
    this.prisma.$connect();

    for (const migrationName of dataMigrations) {
      const migration = await this.prisma.getMigrationByName(migrationName);
      const migrationAppliedCount = migration?.applied_steps_count ?? 0;

      await this.migrator.migrateTo(migrationName as T);
      const newMigration = await this.prisma.getMigrationByName(migrationName);
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

    this.prisma.$disconnect();
  }
}
