import { IDatabase } from '../../services/database/IDatabase';
import { Measurement } from '../../models/Measurement';
import { injectable, inject } from "inversify";
import { DITokens } from "../../inversify.tokens"

@injectable()
export class MeasurementRepository {

    constructor(
        @inject(DITokens.DatabaseService) private db: IDatabase
    ) { }

    async create(measurement: Measurement): Promise<number> {
        const dbResult = await this.db.query(
            'INSERT INTO measurements (session_id, sys, dia, puls) VALUES (?, ?, ?, ?)',
             [measurement.sessionId, measurement.sys, measurement.dia, measurement.puls]);
        return dbResult.insertId;
    }

    async update(measurement: Measurement): Promise<void> {
        await this.db.query(
            'UPDATE measurements SET sys = ?, dia = ?, puls = ? WHERE measurement_id = ?',
            [measurement.sys, measurement.dia, measurement.puls, measurement.measurementId]);
    }

    async delete(measurementId: number): Promise<void> {
        await this.db.query('DELETE FROM measurements WHERE measurement_id = ?', [measurementId]);
    }
}