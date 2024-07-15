class MariaDBDatabase implements IDatabase {
    async query(sql: string, params: any[] = []): Promise<any> {
        // Implement the query method using MariaDB client
    }
    // Implement other methods defined in IDatabase
}