import { Config } from "../config/config.type";
import { getConfig } from "../config/getConfig";

export class Logger {
  constructor(private readonly config: Config) {}

  logMessage(message: string) {
    if (this.config.log) {
      console.info(message);
    }
  }
}
