import { myContainer } from '../inversify.config';
import { Session } from '../models/Session';
import { ISessionRepository } from '../repositories/interfaces/ISessionRepository';
import { Measurement } from '../models/Measurement';
import { IMeasurementRepository } from '../repositories/interfaces/IMeasurementRepository';
import fs from 'fs';

export interface BloodPressureEntry {
    date: string; // Assuming format YYYY-MM-DD
    time: string; // Assuming format HH:MM
    sys: number;
    dia: number;
    puls: number;
    comment?: string;
}

export class ImportFromJsonService {
    public entries: BloodPressureEntry[] = [];
    private grouppedEntries!: BloodPressureEntry[][];
    private sessionAutoTimeSpan: number; // Time span in minutes to guess which measurments belong to the same session

    constructor(private filePath: string, timeSpan: number) {
        this.sessionAutoTimeSpan = timeSpan;
    }

    async loadAsync(): Promise<void> {
        try {
            const data = await fs.promises.readFile(this.filePath, 'utf8');
            const json = JSON.parse(data);
            this.entries = json.entries as BloodPressureEntry[];
        } catch (error) {
            console.error(`Failed to load entries from ${this.filePath}:`, error);
        }
    }

    private entryToTimestamp(entry: BloodPressureEntry): number {
        const [year, month, day] = entry.date.split('.').map(Number);
        const [hour, minute] = entry.time.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute).getTime();
    }

    async loadAndGroupAsync(): Promise<BloodPressureEntry[][]> {
        await this.loadAsync(); // Ensure entries are loaded
        const sortedEntries = this.entries.sort((a, b) => this.entryToTimestamp(a) - this.entryToTimestamp(b));
        this.grouppedEntries = [];
        let currentGroup: BloodPressureEntry[] = [];

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

    async saveEntryWithSessionId(entry: BloodPressureEntry, sessionId: number | null): Promise<any> {
        const createdAt = new Date(entry.date);
        const measurement: Measurement = new Measurement(null, sessionId, createdAt, entry.sys, entry.dia, entry.puls); //, entry.comment);
        const repository = myContainer.get<IMeasurementRepository>('MeasurementRepository');
        await repository.save(measurement);
    }

    async saveGroupAsSession(group: BloodPressureEntry[]) {
        // just create a session with the first entry's timestamp
        const sessionTimestamp = this.entryToTimestamp(group[0]);
        const session = new Session(null, new Date(sessionTimestamp));
        // save the session to the database and return the sessionId
        const repository = myContainer.get<ISessionRepository>('SessionRepository');
        await repository.save(session);
        return session.sessionId;
    }

}    
