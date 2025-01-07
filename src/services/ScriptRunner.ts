import { execSync } from "child_process";
import { Config } from "../config/config.type";

export class ScriptRunner {
  constructor(private readonly config: Config) {}

  run(fileName: string) {
    execSync(
      `${this.config.scriptExecutor} ${fileName}.${this.config.scriptExt}`,
      { stdio: "inherit" }
    );
  }
}
