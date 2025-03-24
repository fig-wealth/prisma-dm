import { execSync } from "child_process";

export abstract class PrismaCLI {
  static generate({ schema }: { schema: string }) {
    const baseCommand = "npx prisma generate";
    const schemaFlag = `--schema=${schema}`;

    execSync(`${baseCommand} ${schemaFlag}`, { stdio: "ignore" });
  }

  static migrateDeploy() {
    const schemaFlag = `--schema=./src/lib/schema`;
    (0, child_process_1.execSync)(`npx prisma migrate deploy ${schemaFlag}`, { stdio: "inherit" });
  }
}
