import { ConfigSchema } from "../config/config.type";

export class Logger {
  constructor(private readonly config: ConfigSchema) {}

  logInfo(message: string) {
    if (this.config.log === "info") {
      console.info(message);
    }
  }

  logVerbose(message: string) {
    if (this.config.log === "verbose") {
      console.info(message);
    }
  }
}
