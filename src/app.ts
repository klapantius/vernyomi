import express from 'express';
import { myContainer } from "./inversify.config";
import { IDatabase } from "./database/IDatabase";
import { ISessionRepository } from './repositories/interfaces/ISessionRepository';
import { IMeasurementRepository } from './repositories/interfaces/IMeasurementRepository';
import { ImportFromJsonService } from "./services/ImportFromJsonService";
import { MeasurementService } from './services/MeasurementService';

export class Application {
    database: IDatabase;
    app: express.Application;

    constructor() {
        this.database = myContainer.get<IDatabase>('IDatabase');
        this.app = express();
    }

    public setupServer(): void {
        this.app.use(express.json());
        
        this.app.use(express.static('public'));
        this.app.get('/', (_, res) => {
            res.sendFile('index.html', { root: 'public' });
        });

        this.app.post('/start-session', async (_, res) => {
            const repo = myContainer.get<ISessionRepository>('ISessionRepository');
            res.json({
                sessionId: await repo.createSessionAsync(),
                message: 'Session started successfully'
            });
        });

        this.app.post('/save-measurement', async (req, res) => {
            const repo = myContainer.get<IMeasurementRepository>('IMeasurementRepository');
            const measurementService = new MeasurementService(repo);
            await measurementService.saveMeasurement(req.body);
            res.json({
                message: 'Measurement saved successfully'
            });
        });

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