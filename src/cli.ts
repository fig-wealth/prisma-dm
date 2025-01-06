#!/usr/bin/env node

import { CLI } from "./services/CLI";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: prisma-dm <command>");
  console.log("Available commands:");
  console.log("  init - Initialize config file");
  console.log("  generate - generate types");
  process.exit(1);
}

const cli = new CLI();
const command = args[0];

console.log(`Running command: ${command}`);

if (command in cli) {
  cli[command]();
} else {
  console.error(`Unknown command: ${command}`);
}
