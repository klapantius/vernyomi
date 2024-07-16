import { ImportFromJsonService } from '../../src/services/ImportFromJsonService';
import { BackupEntry } from '../../src/models/BackupEntry';
import { IMeasurementRepository } from '../../src/repositories/interfaces/IMeasurementRepository';
import { myContainer } from '../../src/inversify.config';

describe('ImportFromJsonService', () => {
    let service: ImportFromJsonService;
    let mockMeasurementRepository: Partial<IMeasurementRepository>;

    beforeEach(() => {
        mockMeasurementRepository = {
            save: jest.fn().mockResolvedValue(undefined) // Adjust based on actual return value
        };
        myContainer.bind<IMeasurementRepository>('MeasurementRepository').toConstantValue(mockMeasurementRepository as IMeasurementRepository);
        service = new ImportFromJsonService('../../test/data/backup.json', 5);
    });

    it('should save entry with session ID and correct date', async () => {
        const entry: BackupEntry = {
            date: '2023-11-22',
            time: '01:02',
            sys: 120,
            dia: 80,
            puls: 70,
            // comment: 'Test comment', // Uncomment if your model uses it
        };
        const sessionId = 1;

        await service.saveEntryWithSessionId(entry, sessionId);

        expect(mockMeasurementRepository.save).toHaveBeenCalledWith(expect.objectContaining({
            measurementId: null,
            sessionId: sessionId,
            createdAt: new Date('2023-11-22T01:02:00Z'),
            sys: entry.sys,
            dia: entry.dia,
            puls: entry.puls,
            // comment: entry.comment, // Uncomment if your model uses it
        }));
    });
});