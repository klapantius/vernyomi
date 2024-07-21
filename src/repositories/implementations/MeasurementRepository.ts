import { IDatabase } from '../../services/database/IDatabase';
import { Measurement } from '../../models/Measurement';
import { injectable, inject } from "inversify";
import { DITokens } from "../../inversify.tokens"

@injectable()
export class MeasurementRepository {

    constructor(
        @inject(DITokens.DatabaseService) private db: IDatabase
    ) { }

    async save(measurement: Measurement): Promise<number> {
        const dbResult = await this.db.query('INSERT INTO measurements (sessionId, sys, dia, puls) VALUES (?, ?, ?, ?)', [measurement.sessionId, measurement.sys, measurement.dia, measurement.puls]);
        return dbResult.insertId;
    }
}