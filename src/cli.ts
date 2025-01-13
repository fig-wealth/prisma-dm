#!/usr/bin/env node

import { getConfig } from "./config/getConfig";
import { CLI } from "./services/CLI";
import { Logger } from "./services/Logger";
import { DB } from "./services/DB";
import { ScriptRunner } from "./services/ScriptRunner";
import { TargetedPrismaMigrator } from "./services/TargetedPrismaMigrator";
import { Validator } from "./services/Validator";
import { Command } from "commander";
import packageJson from "../package.json";
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
  .description("CLI for Prisma data migrations")
  .version(packageJson.version);

program
  .command("init")
  .description("Generate configuration file")
  .action(() => {
    CLI.init();
  });

program
  .command("merge:schema")
  .description("Merge prisma schema folder to single schema file")
  .option("--schema <value>", "Path to schema folder", "prisma/schema")
  .option(
    "--output <value>",
    "Path to output schema file",
    "prisma/schema.prisma"
  )
  .action((options) => {
    const output = options.output as string;
    const schema = options.schema as string;

    createCLI().mergeSchema(
      schema ?? "prisma/schema",
      output ?? "prisma/schema.prisma"
    );
  });

program
  .command("generate")
  .description("Generate types for data migrations by prisma schemas")
  .action(() => {
    createCLI().generate();
  });

program
  .command("migrate")
  .description("Migrate to target migration with post scripts execution")
  .option("--to <value>", "Target migration", "latest")
  .action(async (options) => {
    const toOption = options.to as string | undefined;
    const to = toOption === "latest" ? undefined : toOption;

    await createCLI().migrate({ to });
  });

program.on("command:*", () => {
  console.error("Unknown command: %s", program.args.join(" "));
  program.help();
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
