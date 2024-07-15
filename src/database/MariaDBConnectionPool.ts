import { Pool, createPool } from 'mariadb';
import * as fs from 'fs';

export class MariaDBConnectionPool {
    private static instance: Pool;

    private constructor() {}

    public static getInstance(): Pool {
        if (!MariaDBConnectionPool.instance) {
            // load connection.cfg as alternative source of connection parameters
            const connectionConfig = JSON.parse(fs.readFileSync('../connection.cfg', 'utf8'));
            MariaDBConnectionPool.instance = createPool({
                host: connectionConfig?.DB_HOST ?? process.env.DB_HOST,
                user: connectionConfig?.DB_USER ?? process.env.DB_USER,
                password: connectionConfig?.DB_PASSWORD ?? process.env.DB_PASSWORD,
                database: connectionConfig?.DB_NAME ?? process.env.DB_NAME,
                connectionLimit: 10
            });
        }
        return MariaDBConnectionPool.instance;
    }
}