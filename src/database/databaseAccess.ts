import mariadb from 'mariadb';
import { CreateTableTemplates } from './createTableTemplates';

export class DatabaseAccess {
    pool: mariadb.Pool;
    dbName: string;
    conn: mariadb.PoolConnection | undefined = undefined;

    constructor(pool: mariadb.Pool, dbName: string) {
        // todo: add sanity checks
        this.pool = pool;
        this.dbName = dbName;
    }

    public async initAsync() {
        try {
            this.conn = await this.pool.getConnection();
            if (!this.conn) { throw 'Contacting the database server failed.'; }
            console.log('authenticated');
            await this.conn.query(`use ${this.dbName};`);
            console.log(`connected to database "${this.dbName}"`);
            const results = await Promise.all([
                this.conn.query(CreateTableTemplates.Sessions),
                this.conn.query(CreateTableTemplates.Measurements),
            ]);
            console.log(`tables are in place: ${results.filter(r => r.constructor?.name === 'OkPacket').length}/2`);
        } catch (err) {
            console.log(`caught: ${err}`);
            throw 'database initialization failed';
        } finally {
            // if (this.conn) return this.conn.end();
        }
    }

    public async fillTablesFromBackup() {
        const backupFile = '';
    }

}

