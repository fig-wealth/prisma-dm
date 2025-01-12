import { execSync } from "child_process";
import { ConfigSchema } from "../config/config.type";
import path from "path";

export class ScriptRunner {
  constructor(private readonly config: ConfigSchema) {}

  runPostScript(migrationPath: string) {
    const execCommand = this.config.execScriptCommand.replace(
      "${post}",
      path.join(migrationPath, "post")
    );

    execSync(execCommand, { stdio: "inherit" });
  }
}
