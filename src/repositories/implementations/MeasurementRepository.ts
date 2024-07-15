import { IDatabase } from '../../database/IDatabase';
import { Measurement } from '../../models/Measurement';

export class MeasurementRepository {
    private db: IDatabase;

    constructor(db: IDatabase) {
        this.db = db;
    }

    async save(measurement: Measurement): Promise<Measurement> {
        throw new Error('Not implemented yet'); // Implement this method
        // Use this.db.query(...) to interact with the database
    }
}