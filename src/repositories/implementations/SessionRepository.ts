import { IDatabase } from '../../services/database/IDatabase';
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
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day} ${hours}:${minutes}`;

        const dbResult = await this.db.query('INSERT INTO sessions (started_at, comment, creationSource) VALUES (?, ?, ?)',
            [dateStr, comment ?? "", creationSource]);
        return dbResult.insertId;
    }
}
