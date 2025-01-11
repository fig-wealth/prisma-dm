import { MigrationModel } from "../types/MigrationModel";
import { createPool, DatabasePool, sql } from "slonik";

export class DB {
  private pool: DatabasePool;

  async connect() {
    this.pool = await createPool(process.env.DATABASE_URL);
  }

  async disconnect() {
    await this.pool.end();
  }

  async isPrismaMigrationsTableExists(): Promise<boolean> {
    const query = await this.pool.query(
      sql.unsafe`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_prisma_migrations')`
    );

    return query.rows[0].exists;
  }

  async getMigrationByName(name: string): Promise<MigrationModel | null> {
    const query = await this.pool.query(
      sql.unsafe`SELECT * FROM "_prisma_migrations" WHERE migration_name = ${name}`
    );

    return query.rows[0] ?? null;
  }
}
