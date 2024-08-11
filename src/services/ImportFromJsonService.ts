import fs from 'fs';
import { myContainer } from '../inversify.config';
import { DITokens } from '../inversify.tokens';
import { ISessionRepository } from '../repositories/interfaces/ISessionRepository';
import { Measurement } from '../models/Measurement';
import { IMeasurementRepository } from '../repositories/interfaces/IMeasurementRepository';
import { BackupEntry } from '../models/BackupEntry';
import { SessionCreationSource } from '../models/SessionCreationSource';

export class ImportFromJsonService {
    public entries: BackupEntry[] = [];
    private grouppedEntries!: BackupEntry[][];
    private sessionAutoTimeSpan: number; // Time span in minutes to guess which measurements belong to the same session

    constructor(private filePath: string, timeSpan: number) {
        this.sessionAutoTimeSpan = timeSpan;
    }

    async loadAsync(): Promise<void> {
        try {
            const data = await fs.promises.readFile(this.filePath, 'utf8');
            const json = JSON.parse(data);
            this.entries = json.entries as BackupEntry[];
        } catch (error) {
            console.error(`Failed to load entries from ${this.filePath}:`, error);
        }
    }

    private entryToTimestamp(entry: BackupEntry): number {
        const [y, month, day] = entry.date.split('.').map(Number);
        const year = y < 100 ? y + 2000 : y;
        const [hour, minute] = entry.time.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute).getTime();
    }

    async loadAndGroupAsync(forceLoad: Boolean = false): Promise<BackupEntry[][]> {
        // Ensure entries are loaded
        if (!this.entries || this.entries.length === 0 || forceLoad) {
            await this.loadAsync();
        }

        // sort and group them
        const sortedEntries = this.entries.sort((a, b) => this.entryToTimestamp(a) - this.entryToTimestamp(b));
        this.grouppedEntries = [];
        let currentGroup: BackupEntry[] = [];

        sortedEntries.forEach((entry, index) => {
            if (index === 0) {
                currentGroup.push(entry);
            } else {
                const previousEntry = sortedEntries[index - 1];
                const diff = (this.entryToTimestamp(entry) - this.entryToTimestamp(previousEntry)) / 60000; // Difference in minutes
                if (diff <= this.sessionAutoTimeSpan) {
                    currentGroup.push(entry);
                } else {
                    this.grouppedEntries.push(currentGroup);
                    currentGroup = [entry];
                }
            }
        });

        if (currentGroup.length > 0) {
            this.grouppedEntries.push(currentGroup);
        }

        return this.grouppedEntries;
    }

    async saveToDatabase(): Promise<void> {
        await Promise.all(this.grouppedEntries.map(async (group) => {
            // save the group as Session to the database to get the sessionId
            const sessionId = await this.saveGroupAsSession(group);
            // then save each entry with the sessionId
            await Promise.all(group.map((entry) => this.saveEntryWithSessionId(entry, sessionId)));
        }));
    }

    async saveEntryWithSessionId(entry: BackupEntry, sessionId: number | null): Promise<any> {
        const createdAt = new Date(`${entry.date.replace(/\./g, '-')}T${entry.time}:00.000Z`);
        const measurement: Measurement = new Measurement({
            sessionId: sessionId,
            measurementId: null,
            createdAt: createdAt,
            sys: entry.sys,
            dia: entry.dia,
            puls: entry.puls,
            // comment: entry.comment,
        });
        const repository = myContainer.get<IMeasurementRepository>(DITokens.MeasurementRepository);
        await repository.create(measurement);
    }

    async saveGroupAsSession(measurements: BackupEntry[]) {
        const repository = myContainer.get<ISessionRepository>(DITokens.SessionRepository);
        const sessionId = await repository.createSessionAsync(
            SessionCreationSource.ImportFromBackup,
            measurements[0].comment,
            new Date(this.entryToTimestamp(measurements[0])));
        return sessionId;
    }

}    
