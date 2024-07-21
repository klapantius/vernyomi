import { IDatabase } from '../../services/database/IDatabase';
import { SessionCreationSource } from '../../models/SessionCreationSource';
import { ISessionRepository } from '../interfaces/ISessionRepository';
import { inject, injectable } from "inversify";
import { DITokens } from "../../inversify.tokens"
import { GetDateString, serializeBigInt } from '../../services/database/utils';

@injectable()
export class SessionRepository implements ISessionRepository {

    constructor(
        @inject(DITokens.DatabaseService) private db: IDatabase
    ) { }

    public async createSessionAsync(creationSource: SessionCreationSource, comment?: string, createdAt?: Date): Promise<number> {
        const dbResult = await this.db.query('INSERT INTO sessions (started_at, comment, creationSource) VALUES (?, ?, ?)',
            [GetDateString(createdAt), comment ?? "", creationSource]);
        const id = serializeBigInt(dbResult.insertId);
        if (typeof id === 'number') {
            return id;
        }
        throw new Error('session ID is already too big to be represented as a number');
    }
}
