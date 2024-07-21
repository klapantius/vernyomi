import { DatabaseWriteOperationResult, IDatabase } from "./IDatabase";
import "reflect-metadata";
import { injectable } from "inversify";
import { Pool } from "mariadb";
import { MariaDBConnectionPool } from "./MariaDBConnectionPool";
import { CreateTableTemplates } from "./createTableTemplates";

@injectable()
export class MariaDBDatabase implements IDatabase {
    private pool: Pool;

    constructor() {
        this.pool = MariaDBConnectionPool.getInstance();
    }

    async warmup(): Promise<void> {
        try {
            const conn = await this.pool.getConnection();
            try {
                const results = await Promise.all([
                    conn.query(CreateTableTemplates.Sessions),
                    conn.query(CreateTableTemplates.Measurements),
                ]);
                } finally {
                conn.release(); // Release the connection back to the pool
            }
        } catch (err) {
            console.error('Database warmup error', err);
            throw err; // Rethrow after logging
        }
    }

    async query(sql: string, values?: any[]): Promise<any> {
        try {
            const conn = await this.pool.getConnection();
            try {
                const result = await conn.query(sql, values);
                if (result?.affectedRows != null) { // this is usually true after a write-operatation
                    return new DatabaseWriteOperationResult(result.affectedRows, result.insertId, result.warningStatus);
                }
                return result;
            } finally {
                conn.release(); // Release the connection back to the pool
            }
        } catch (err) {
            console.error('Database query error', err);
            throw err; // Rethrow after logging
        }
    }
}