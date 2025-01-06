import { execSync } from "child_process";

export abstract class PrismaCLI {
  static generate({ schema }: { schema: string }) {
    const baseCommand = "npx prisma generate";
    const schemaFlag = `--schema=${schema}`;

    execSync(`${baseCommand} ${schemaFlag}`, { stdio: "inherit" });
  }

  static migrateDeploy() {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  }
}
