#!/usr/bin/env node

import { getConfig } from "./config/getConfig";
import { CLI } from "./services/CLI";
import { Logger } from "./services/Logger";
import { DB } from "./services/DB";
import { ScriptRunner } from "./services/ScriptRunner";
import { TargetedPrismaMigrator } from "./services/TargetedPrismaMigrator";
import { Validator } from "./services/Validator";
import { Command } from "commander";
import dotenv from "dotenv";

dotenv.config();

const program = new Command();

function createCLI() {
  const config = getConfig();
  const logger = new Logger(config);
  const prisma = new DB();
  const validator = new Validator(config);
  const scriptRunner = new ScriptRunner(config);
  const migrator = new TargetedPrismaMigrator(logger);
  const cli = new CLI(migrator, scriptRunner, prisma, validator, logger);

  return cli;
}

program
  .name("prisma-dm")
  .description("CLI for Prisma data management")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize config file")
  .action(() => {
    CLI.init();
  });

program
  .command("generate")
  .description("Generate types")
  .action(() => {
    createCLI().generate();
  });

program
  .command("migrate")
  .description("Data migration")
  .option("--to <value>", "Target migration")
  .action((options) => {
    const toValue = options.to as string | undefined;

    createCLI().migrate({ to: toValue });
  });

program.on("command:*", () => {
  console.error("Unknown command: %s", program.args.join(" "));
  program.help();
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
