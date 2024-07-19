import { IDatabase } from '../../database/IDatabase'; // Import the correct type 'IDatabase'
import { SessionCreationSource } from '../../models/SessionCreationSource';
import { ISessionRepository } from '../interfaces/ISessionRepository';
import { injectable } from "inversify";

@injectable()
export class SessionRepository implements ISessionRepository {
    private db: IDatabase;

    constructor(db: IDatabase) {
        this.db = db;
    }

    public async createSessionAsync(creationSource: SessionCreationSource): Promise<number> {
        const dbResult = await this.db.query('INSERT INTO sessions (timestamp, creationSource) VALUES (?)',
            [new Date(), creationSource]);
        return dbResult.insertId;
    }
}
