import { getConfig } from "../config/getConfig";

export class Logger {
  constructor() {}

  logMessage(message: string) {
    const config = getConfig();

    if (config.log) {
      console.info(message);
    }
  }
}
