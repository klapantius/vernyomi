export interface IDatabase {
    query(sql: string, params?: any[]): Promise<any>;
    // Add other necessary operations like connect, insert, update, delete
}