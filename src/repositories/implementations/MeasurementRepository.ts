import { IDatabase } from '../../database/IDatabase';
import { Measurement } from '../../models/Measurement';
import { injectable } from "inversify";

@injectable()
export class MeasurementRepository {
    private db: IDatabase;

    constructor(db: IDatabase) {
        this.db = db;
    }

    async save(measurement: Measurement): Promise<number> {
        const dbResult = await this.db.query('INSERT INTO measurements (sessionId, sys, dia, puls) VALUES (?, ?, ?, ?)', [measurement.sessionId, measurement.sys, measurement.dia, measurement.puls]);
        return dbResult.insertId;
    }
}