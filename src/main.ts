import path from "path";
import fs from "fs-extra";
import { execSync } from "child_process";

type MigrationDirFile<T extends string> = T | "migration_lock.toml";
type DataMigrationOptions = {
  migrationsDir: string;
  tempDir: string;
  log?: boolean;
};

export class DataMigration<T extends string> {
  private readonly migrationsDir: DataMigrationOptions["migrationsDir"];
  private readonly tempDir: DataMigrationOptions["tempDir"];
  private readonly log: NonNullable<DataMigrationOptions["log"]>;

  constructor({ migrationsDir, tempDir, log }: DataMigrationOptions) {
    this.migrationsDir = migrationsDir;
    this.tempDir = tempDir;
    this.log = log ?? true;
  }

  private logMessage(message: string) {
    if (this.log) {
      console.info(message);
    }
  }

  private exec(cmd: string) {
    return execSync(cmd, { stdio: "inherit" });
  }

  private execPrismaMigrateDeploy() {
    this.exec("npx prisma migrate deploy");
  }

  private createTempDir() {
    return fs.mkdir(this.tempDir, { recursive: true }).catch((e) => {
      throw new Error(`Error creating temp dir: ${e.message}`);
    });
  }

  private removeTempDir() {
    return fs.rmdir(this.tempDir).catch((e) => {
      throw new Error(`Error removing temp dir: ${e.message}`);
    });
  }

  private async getMigrationFiles() {
    const files = await fs.readdir(this.migrationsDir).catch((e) => {
      throw new Error(`Error reading migrations files: ${e.message}`);
    });

    return files as MigrationDirFile<T>[];
  }

  private async moveFilesToTempDir(files: T[]) {
    for (const file of files) {
      const src = path.resolve(this.migrationsDir, file);
      const dest = path.resolve(this.tempDir, file);

      try {
        await fs.copy(src, dest);
        await fs.rm(src, { recursive: true, force: true });
      } catch (e) {
        throw new Error(`Error moving file ${file} to temp dir: ${e.message}`);
      }
    }
  }

  private async moveFilesBackToMigrationsDir(files: T[]) {
    for (const file of files) {
      const src = path.resolve(this.tempDir, file);
      const dest = path.resolve(this.migrationsDir, file);

      try {
        await fs.copy(src, dest);
        await fs.rm(src, { recursive: true, force: true });
      } catch (e) {
        throw new Error(
          `Error moving file ${file} back to migrations dir: ${e.message}`
        );
      }
    }
  }

  async migrateTo(targetMigration: T) {
    const migrationFiles = await this.getMigrationFiles();
    const indexOfTargetMigration = migrationFiles.indexOf(targetMigration);

    if (indexOfTargetMigration === -1) {
      throw new Error(`Migration ${targetMigration} not found`);
    }

    const filesToMove = migrationFiles.slice(
      indexOfTargetMigration + 1,
      -1
    ) as T[];

    this.logMessage("Creating temp dir...");
    await this.createTempDir();

    this.logMessage("Moving migrations files to temp dir...");
    await this.moveFilesToTempDir(filesToMove);

    try {
      this.execPrismaMigrateDeploy();

      this.logMessage(
        `All migrations to ${targetMigration} have been applied successfully!`
      );
    } finally {
      this.logMessage("Moving migrations files back to migrations dir...");
      await this.moveFilesBackToMigrationsDir(filesToMove);

      this.logMessage("Removing temp dir...");
      await this.removeTempDir();
    }
  }
}
