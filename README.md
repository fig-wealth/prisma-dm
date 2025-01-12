# Prisma Data Migrations

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
  - [Commands](#commands)
  - [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Warnings and Considerations](#warnings-and-considerations)
- [Contributing](#contributing)
- [License](#license)

## Overview

Prisma Data Migrations is a library designed to address the lack of built-in support for data migrations in Prisma ORM. It allows you to execute post-migration scripts alongside schema migrations.

## Installation

Install the library via npm:

```bash
npm install prisma-data-migrations --save-dev
```

## Usage

### Commands

```bash
npx prisma-dm help
```

Output:

```
Usage: prisma-dm [options] [command]

CLI for Prisma data migrations

Options:
  -V, --version      output the version number
  -h, --help         display help for command

Commands:
  init               Initialize config file
  generate           Generate types for data migrations by prisma schemas
  migrate [options]  Migrate to target migration with post scripts execution
  help [command]     display help for command
```

### Quick Start

1. **Initialize Configuration**:
   Run the following command to create a configuration file:

   ```bash
   npx prisma-dm init
   ```

   This generates a default configuration file (`prisma-dm.config.json`) in the root of your project.

2. **Add `schema.prisma` to Migration Folders**:
   Place the `schema.prisma` file in the corresponding migration folder alongside `migration.sql`. This file must match the schema state after applying the Prisma migration.

3. **Generate Types**:
   Run the `generate` command to create TypeScript types for your data migrations based on your schemas:

   ```bash
   npx prisma-dm generate
   ```

4. **Create Post-Migration Script**:
   Create a post-migration script in the migration folder. The script must be named `post` and can have any file extension (e.g., `.ts`, `.js`, `.sh`). Example:

   ```typescript
   import {
     Prisma,
     PrismaClient,
   } from "prisma-data-migrations/migrations/20250108201031_add_user_name";

   async function nameUsers(prisma: Prisma.TransactionClient) {
     await prisma.user.updateMany({
       data: {
         name: "Name for users :)",
       },
     });
   }

   const prisma = new PrismaClient();
   prisma.$transaction(nameUsers, { timeout: 60_000 });
   ```

   ### ⚠️ **Important** ⚠️

   - Always wrap your logic in a transaction to ensure atomic operations.
   - If the post script fails, you must manually reapply it after resolving the issue.

   After completing this step, your directory structure should look like this:

   ```
   project-root/
   ├── prisma/
   │   ├── migrations/
   │       ├── 20250108201031_add_user_name/
   │           ├── migration.sql
   │           ├── schema.prisma
   │           └── post.ts
   ├── prisma-dm.config.json
   ```

5. **Run Migration**:
   Execute the migration and post-migration script using:

   ```bash
   npx prisma-dm migrate
   ```

## Configuration

The configuration file (`prisma-dm.config.json`) allows customization of the library. Key fields include:

- **`execScriptCommand`**: Specifies the command to execute the post-migration script. Include the placeholder `${post}` for the script name. Example:

  - For `.ts` scripts: `"tsx ${post}.ts"`
  - For shell scripts: `"sh ${post}.sh"`

- **`outputDir`**: Directory for generated migration files. Default: `../../../node_modules/prisma-data-migrations/migrations`.

- **`migrationsDir`**: Directory containing Prisma migrations. Default: `prisma/migrations`.

- **`tempDir`**: Temporary directory for moving migration folders during execution. Default: `prisma/.temp`.

- **`log`**: Logging level (`none`, `info`, `verbose`). Default: `info`.

## Warnings and Considerations

### ⚠️ Key Warnings ⚠️

- **Post scripts and transactions**:

  - Post scripts are not included in the same transaction as schema migrations.
  - If a post script fails, you will need to manually reapply it after resolving the issue.

- **Development status**:

  - This library is developed and maintained by a single developer and has not been fully tested. Issues may occur.
  - Please report problems or submit feature requests—I am always open to feedback and contributions.

- **Database support**:

  - Fully tested with PostgreSQL.
  - Other databases may require additional logic; contributions are welcome.

- **Future improvements**:
  - Plans to track post scripts in a dedicated database table to improve reliability. Community contributions are highly encouraged.

## Contributing

We welcome contributions! Visit the [GitHub Repository](https://github.com/Softjey/prisma-dm) to:

- Report issues
- Provide feedback
- Submit pull requests

## License

This project is open-source under the MIT License.
