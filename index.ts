import mariadb from 'mariadb';
import { DatabaseAccess } from "./databaseAccess";

class Application {
    private readonly pool: mariadb.Pool = mariadb.createPool({
        user: 'bazsi',
        host: 'localhost',
        password: 'izsab',
        connectionLimit: 55
    });
    public async runAsync() {
        const dbInit = new DatabaseAccess(this.pool, 'helloworld');
        await dbInit.initAsync();
    }
}

new Application()
    .runAsync()
    .then(_ => {
        console.log('done');
        process.exit();
    });
