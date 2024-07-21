import express from 'express';
import { Socket } from 'net';
import { Server } from 'http';
import { myContainer } from "./inversify.config";
import { DITokens } from "./inversify.tokens";
import { IDatabase } from "./services/database/IDatabase";
import { ISessionRepository } from './repositories/interfaces/ISessionRepository';
import { IMeasurementRepository } from './repositories/interfaces/IMeasurementRepository';
import { ImportFromJsonService } from "./services/ImportFromJsonService";
import { MeasurementService } from './services/MeasurementService';
import { SessionCreationSource } from './models/SessionCreationSource';

export class Application {
    database: IDatabase;
    app: express.Application;
    private server: Server | null = null;
    private connections: NodeJS.Socket[] = [];

    constructor() {
        this.database = myContainer.get<IDatabase>(DITokens.DatabaseService);
        this.app = express();
    }

    public setupServer(): void {
        this.app.use(express.json());

        this.app.use(express.static('public'));
        this.app.get('/', (_, res) => {
            res.sendFile('index.html', { root: process.cwd() + '/public' });
        });

        this.app.post('/start-session', async (req, res) => {
            const repo = myContainer.get<ISessionRepository>(DITokens.SessionRepository);
            res.json({
                sessionId: await repo.createSessionAsync(
                    SessionCreationSource.InputFromUI,
                    req.body.comment),
                message: 'Session started successfully'
            });
        });

        this.app.post('/save-measurement', async (req, res) => {
            const repo = myContainer.get<IMeasurementRepository>(DITokens.MeasurementRepository);
            const measurementService = new MeasurementService(repo);
            await measurementService.saveMeasurement(req.body);
            res.json({
                message: 'Measurement saved successfully'
            });
        });

        const port = 3000;
        this.server = this.app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });

        // Keep track of active connections
        this.server.on('connection', (connection) => {
            this.connections.push(connection);
            connection.on('close', () => {
                const index = this.connections.indexOf(connection);
                if (index !== -1) {
                    this.connections.splice(index, 1);
                }
            });
        });
    }

    public shutdownServer() {
        if (this.server) {
            this.server.close(() => {
                console.log('Server shut down successfully');
            });
        }
    }

    private gracefulShutdown() {
        console.log('Starting graceful shutdown...');

        // Stop the server from accepting new connections
        this.shutdownServer();

        // Close existing connections
        if (this.connections?.length > 0) {
            this.connections.forEach((conn) => conn.end());
            setTimeout(() => this.connections.forEach((conn) => (conn as Socket).destroy()), 5000);
        }

    };

    public async runAsync() {
        // ensure the db tables are in place
        await this.database.warmup();

        // import data from backup before the first run
        const backupLoader = new ImportFromJsonService('/home/bazsi/code/helloworld/backup.json', 30);
        const grouppedEntries = await backupLoader.loadAndGroupAsync()
        console.log(`Loaded ${backupLoader.entries.length} measurements of ${grouppedEntries.length} sessions from backup file.`);

        // start the web server for the page and API
        this.setupServer();

        // Listen for shutdown signals
        await new Promise((resolve) => {
            process.on('SIGTERM', () => { this.gracefulShutdown(); resolve(true); });
            process.on('SIGINT', () => { this.gracefulShutdown(); resolve(true); });
        });
    }
}