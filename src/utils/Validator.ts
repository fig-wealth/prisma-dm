import fs from "fs-extra";
import path from "path";

export class Validator {
  static isDataMigrationDir(migrationPath: string) {
    const isDir = fs.lstatSync(migrationPath).isDirectory();
    const hasPrismaSchema = fs.existsSync(
      path.join(migrationPath, "schema.prisma")
    );
    const hasPostScript = fs.existsSync(path.join(migrationPath, "post.ts"));

    return isDir && hasPrismaSchema && hasPostScript;
  }
}
