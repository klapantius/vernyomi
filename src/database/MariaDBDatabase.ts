import { IDatabase } from "./IDatabase";
import "reflect-metadata";
import { injectable } from "inversify";
import { Pool } from "mariadb";
import { MariaDBConnectionPool } from "./MariaDBConnectionPool";

@injectable()
export class MariaDBDatabase implements IDatabase {
    private pool: Pool;

    constructor() {
        this.pool = MariaDBConnectionPool.getInstance();
    }

    async query(sql: string, values?: any[]): Promise<any> {
        try {
            const conn = await this.pool.getConnection();
            try {
                const result = await conn.query(sql, values);
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