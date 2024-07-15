import { myContainer } from "./inversify.config";
import { IDatabase } from "./database/IDatabase";
import { ImportFromJsonService } from "./services/ImportFromJsonService";

class Application {
    database: IDatabase;

    constructor() {
        this.database = myContainer.get<IDatabase>('IDatabase');    
    }

    public async runAsync() {
        await this.database.warmup();

        const backupLoader = new ImportFromJsonService('/home/bazsi/code/helloworld/backup.json', 30);
        const grouppedEntries = await backupLoader.loadAndGroupAsync()
        console.log(`Loaded ${backupLoader.entries.length} measurements of ${grouppedEntries.length} sessions from backup file.`);
    }
}

new Application()
    .runAsync()
    .then(_ => {
        console.log('done');
        process.exit();
    });
