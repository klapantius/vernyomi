export interface IDatabase {
    warmup(): Promise<void>;
    query(sql: string, params?: any[]): Promise<any>;
    // Add other necessary operations like connect, insert, update, delete
}

/* this is like the return type from MariaDB's query method,
 * but actually it is meant as a general type
*/
export class DatabaseWriteOperationResult {
    public affectedRows: number;
    public insertId: number;
    public warningStatus: number;

    constructor(affectedRows: number, insertId: number, warningStatus: number) {
        this.affectedRows = affectedRows;
        this.insertId = insertId;
        this.warningStatus = warningStatus;
    }
}