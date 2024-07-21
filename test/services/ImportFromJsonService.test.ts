import { ImportFromJsonService } from '../../src/services/ImportFromJsonService';
import { BackupEntry } from '../../src/models/BackupEntry';
import { IMeasurementRepository } from '../../src/repositories/interfaces/IMeasurementRepository';
import { ISessionRepository } from '../../src/repositories/interfaces/ISessionRepository';
import { myContainer } from '../../src/inversify.config';
import { DITokens } from '../../src/inversify.tokens';
import fs from 'fs';
import { SessionCreationSource } from '../../src/models/SessionCreationSource';

describe('ImportFromJsonService', () => {
    let service: ImportFromJsonService;
    let mockSessionRepository: Partial<ISessionRepository>;
    let mockMeasurementRepository: Partial<IMeasurementRepository>;
    let sessionIdTestCounter = 0;

    beforeEach(() => {
        mockSessionRepository = {
            createSessionAsync: jest.fn(() => {
                return new Promise((resolve, reject) => {
                    resolve(++sessionIdTestCounter);
                });
            })
        };
        mockMeasurementRepository = {
            save: jest.fn().mockResolvedValue(undefined)
        };
        myContainer.unbind(DITokens.MeasurementRepository);
        myContainer.bind<IMeasurementRepository>(DITokens.MeasurementRepository).toConstantValue(mockMeasurementRepository as IMeasurementRepository);
        myContainer.unbind(DITokens.SessionRepository);
        myContainer.bind<ISessionRepository>(DITokens.SessionRepository).toConstantValue(mockSessionRepository as ISessionRepository);
        service = new ImportFromJsonService('../../test/data/backup.json', 5);
    });

    it('should load entries from file', async () => {
        const filePath = '/path/to/backup.json';
        const data = JSON.stringify({ entries: [{ date: '2023.11.22', time: '01:02', sys: 120, dia: 80, puls: 70, comment: 'foo' }] });
        jest.spyOn(fs.promises, 'readFile').mockResolvedValue(data);

        const service = new ImportFromJsonService(filePath, 5);
        await service.loadAsync();

        expect(fs.promises.readFile).toHaveBeenCalledWith(filePath, 'utf8');
        expect(service.entries).toEqual([{ date: '2023.11.22', time: '01:02', sys: 120, dia: 80, puls: 70, comment: 'foo' }]);
    });

    it('should group measurements into sessions based on the specified time span', async () => {
        const entries: BackupEntry[] = [
            { date: '2023.11.22', time: '01:02', sys: 120, dia: 80, puls: 70, comment: 'foo' },
            { date: '2023.11.22', time: '01:05', sys: 130, dia: 85, puls: 75, comment: 'foo' },
            { date: '2023.11.22', time: '02:10', sys: 125, dia: 82, puls: 72, comment: 'foo' },
            { date: '2023.11.22', time: '02:15', sys: 122, dia: 78, puls: 68, comment: 'foo' },
        ];
        const timeSpan = 10; // Time span in minutes

        service.entries = entries;
        (service as any).sessionAutoTimeSpan = timeSpan;

        const groupedEntries = await service.loadAndGroupAsync();

        expect(groupedEntries).toEqual([
            [
                { date: '2023.11.22', time: '01:02', sys: 120, dia: 80, puls: 70, comment: 'foo' },
                { date: '2023.11.22', time: '01:05', sys: 130, dia: 85, puls: 75, comment: 'foo' },
            ],
            [
                { date: '2023.11.22', time: '02:10', sys: 125, dia: 82, puls: 72, comment: 'foo' },
                { date: '2023.11.22', time: '02:15', sys: 122, dia: 78, puls: 68, comment: 'foo' },
            ],
        ]);
    });

    it('should save entry with session ID and correct date', async () => {
        const entry: BackupEntry = {
            date: '2023.11.22',
            time: '01:02',
            sys: 120,
            dia: 80,
            puls: 70,
            comment: 'Test comment'
        };
        const sessionId = 1;

        await service.saveEntryWithSessionId(entry, sessionId);

        expect(mockMeasurementRepository.save).toHaveBeenCalledWith(expect.objectContaining({
            measurementId: null,
            sessionId: sessionId,
            createdAt: new Date('2023-11-22T01:02:00.000Z'),
            sys: entry.sys,
            dia: entry.dia,
            puls: entry.puls,
            // comment: entry.comment, // Uncomment if your model uses it
        }));
    });

    it('should save the entries to the database grouped by session', async () => {
        const groupedEntries: BackupEntry[][] = [
            [
                { date: '2023.11.22', time: '01:02', sys: 120, dia: 80, puls: 70, comment: 'foo' },
                { date: '2023.11.22', time: '01:05', sys: 130, dia: 85, puls: 75, comment: 'Test comment' },
            ],
            [
                { date: '2023.11.22', time: '02:10', sys: 125, dia: 82, puls: 72, comment: 'bar' },
                { date: '2023.11.22', time: '02:15', sys: 122, dia: 78, puls: 68, comment: 'Test comment' },
            ],
        ];

        // const saveGroupAsSessionMock = jest.spyOn(service, 'saveGroupAsSession');
        const saveEntryWithSessionIdMock = jest.spyOn(service, 'saveEntryWithSessionId');

        // let sessionIdTestCounter = 0;
        // saveGroupAsSessionMock.mockImplementation(async (group: BackupEntry[]) => {
        //     // Mock implementation to return an increased sessionId after each call
        //     return ++sessionIdTestCounter;
        // });
        saveEntryWithSessionIdMock.mockImplementation(async (entry: BackupEntry, sessionId: number | null) => {});

        (service as any).grouppedEntries = groupedEntries;
        sessionIdTestCounter = 0;
        await service.saveToDatabase();

        // expect(saveGroupAsSessionMock).toHaveBeenCalledTimes(2);
        expect(mockSessionRepository.createSessionAsync).toHaveBeenCalledWith(SessionCreationSource.ImportFromBackup, "foo");
        expect(mockSessionRepository.createSessionAsync).toHaveBeenCalledWith(SessionCreationSource.ImportFromBackup, "bar");
        // TODO: this should better check how the IMeasurementRepository function gets called
        expect(saveEntryWithSessionIdMock).toHaveBeenCalledTimes(4);
        expect(saveEntryWithSessionIdMock).toHaveBeenCalledWith(
            { date: '2023.11.22', time: '01:02', sys: 120, dia: 80, puls: 70, comment: 'foo' },
            1
        );
        expect(saveEntryWithSessionIdMock).toHaveBeenCalledWith(
            { date: '2023.11.22', time: '01:05', sys: 130, dia: 85, puls: 75, comment: 'Test comment' },
            1
        );
        expect(saveEntryWithSessionIdMock).toHaveBeenCalledWith(
            { date: '2023.11.22', time: '02:10', sys: 125, dia: 82, puls: 72, comment: 'bar' },
            2
        );
        expect(saveEntryWithSessionIdMock).toHaveBeenCalledWith(
            { date: '2023.11.22', time: '02:15', sys: 122, dia: 78, puls: 68, comment: 'Test comment' },
            2
        );
    });

});