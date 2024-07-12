import mariadb from 'mariadb';
import { DatabaseAccess } from "./databaseAccess";
import { GroupedBloodPressureLog } from "./backupLoader";

class Application {
    private readonly pool: mariadb.Pool = mariadb.createPool({
        user: 'bazsi',
        host: 'localhost',
        password: 'izsab',
        connectionLimit: 55
    });
    public async runAsync() {
        // const dbInit = new DatabaseAccess(this.pool, 'helloworld');
        // await dbInit.initAsync();

        const backupLoader = new GroupedBloodPressureLog('/home/bazsi/code/helloworld/backup.json', 30);
        const grouppedEntries = await backupLoader.groupEntries()
        console.log(`Loaded ${backupLoader.entries.length} measurements of ${grouppedEntries.length} sessions from backup file.`);
    }
}

new Application()
    .runAsync()
    .then(_ => {
        console.log('done');
        process.exit();
    });
