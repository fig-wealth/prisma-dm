#!/usr/bin/env node

import { getConfig } from "./config/getConfig";
import { CLI } from "./services/CLI";
import { Logger } from "./services/Logger";
import { PrismaService } from "./services/PrismaService";
import { ScriptRunner } from "./services/ScriptRunner";
import { TargetedPrismaMigrator } from "./services/TargetedPrismaMigrator";
import { Validator } from "./services/Validator";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: prisma-dm <command>");
  console.log("Available commands:");
  console.log("  init - Initialize config file");
  console.log("  generate - generate types");
  process.exit(1);
}

if (args[0] === "init") {
  CLI.init();

  process.exit(0);
}

const config = getConfig();
const logger = new Logger(config);
const prisma = new PrismaService();
const validator = new Validator(config);
const scriptRunner = new ScriptRunner(config);
const migrator = new TargetedPrismaMigrator(logger);
const cli = new CLI(migrator, scriptRunner, prisma, validator, logger);
const command = args[0];

console.log(`Running command: ${command}`);

if (command in cli) {
  cli[command]();
} else {
  console.error(`Unknown command: ${command}`);
}
