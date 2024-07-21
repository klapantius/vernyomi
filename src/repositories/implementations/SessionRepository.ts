import { IDatabase } from '../../database/IDatabase';
import { SessionCreationSource } from '../../models/SessionCreationSource';
import { ISessionRepository } from '../interfaces/ISessionRepository';
import { inject, injectable } from "inversify";
import { DITokens } from "../../inversify.tokens"

@injectable()
export class SessionRepository implements ISessionRepository {

    constructor(
        @inject(DITokens.DatabaseService) private db: IDatabase
    ) { }

    public async createSessionAsync(creationSource: SessionCreationSource, comment?: string): Promise<number> {
        const dbResult = await this.db.query('INSERT INTO sessions (timestamp, comment, creationSource) VALUES (?)',
            [new Date(), comment ?? null, creationSource]);
        return dbResult.insertId;
    }
}
