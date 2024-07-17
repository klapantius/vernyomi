import express from 'express';
import { myContainer } from "./inversify.config";
import { IDatabase } from "./database/IDatabase";
import { ImportFromJsonService } from "./services/ImportFromJsonService";

class Application {
    database: IDatabase;
    app: express.Application;

    constructor() {
        this.database = myContainer.get<IDatabase>('IDatabase');    
        this.app = express();
    }

    private setupServer(): void {
        this.app.get('/', (_, res) => {
            res.send('Hello World!');
        });

        // Define more routes here

        const port = 3000;
        this.app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    }

    public async runAsync() {
        // ensure the db tables are in place
        await this.database.warmup();

        // import data from backup before the first run
        const backupLoader = new ImportFromJsonService('/home/bazsi/code/helloworld/backup.json', 30);
        const grouppedEntries = await backupLoader.loadAndGroupAsync()
        console.log(`Loaded ${backupLoader.entries.length} measurements of ${grouppedEntries.length} sessions from backup file.`);

        // start the web server for the page and API
        this.setupServer();        
    }
}

new Application()
    .runAsync()
    .then(_ => {
        console.log('done');
        process.exit();
    });
