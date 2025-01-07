import { execSync } from "child_process";
import { getConfig } from "../config/getConfig";

export abstract class ScriptRunner {
  static run(fileName: string) {
    const config = getConfig();

    execSync(`${config.scriptExecutor} ${fileName}.${config.scriptExt}`, {
      stdio: "inherit",
    });
  }
}
