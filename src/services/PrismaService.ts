import { PrismaClient } from "@prisma/client";
import { MigrationModel } from "../types/MigrationModel";

export class PrismaService extends PrismaClient {
  async getMigrationByName(name: string): Promise<MigrationModel | null> {
    const migrations = await this
      .$queryRaw`SELECT * FROM "_prisma_migrations" WHERE migration_name = ${name}`;

    return migrations[0] ?? null;
  }
}
