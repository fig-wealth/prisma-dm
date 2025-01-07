import fs from "fs-extra";
import path from "path";
import { Config } from "../config/config.type";

export class Validator {
  constructor(private readonly config: Config) {}

  isDataMigration(migrationName: string) {
    const migrationPath = path.join(this.config.migrationsDir, migrationName);
    const isDir = fs.lstatSync(migrationPath).isDirectory();
    const hasPrismaSchema = fs.existsSync(
      path.join(migrationPath, "schema.prisma")
    );
    const hasPostScript = fs.existsSync(path.join(migrationPath, "post.ts"));

    return isDir && hasPrismaSchema && hasPostScript;
  }

  isMigration(name: string) {
    const migrationsDirPath = path.join(
      process.cwd(),
      this.config.migrationsDir
    );
    const migrationsDir = fs.readdirSync(migrationsDirPath);

    return name !== "migration_lock.toml" && migrationsDir.includes(name);
  }

  validateMigrationName(name: string) {
    if (!this.isMigration(name)) {
      throw new Error(`Migration with name ${name} does not exist`);
    }
  }
}
