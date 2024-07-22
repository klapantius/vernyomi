import { IDatabase } from '../../services/database/IDatabase';
import { SessionCreationSource } from '../../models/SessionCreationSource';
import { ISessionRepository } from '../interfaces/ISessionRepository';
import { inject, injectable } from "inversify";
import { DITokens } from "../../inversify.tokens"
import { GetDateString, serializeBigInt } from '../../services/database/utils';
import { ComplexSession } from '../../models/ComplexSession';
import { Measurement } from '../../models/Measurement';

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

    public async getSessions(limit: number): Promise<ComplexSession[] | null> {
        const dbResult = await this.db.query('SELECT * FROM sessions ORDER BY started_at DESC LIMIT ?', [limit]);
        if (dbResult.length === 0) {
            return null;
        }
        const sessions: ComplexSession[] = [];
        for (const session of dbResult) {
            const measurements = await this.db.query('SELECT * FROM measurements WHERE session_id = ?', [session.session_id]);
            sessions.push(new ComplexSession(
                session.id,
                new Date(session.started_at),
                session.comment,
                session.creationSource,
                measurements.map((m: any) => new Measurement({
                    measurementId: m.id,
                    sessionId: m.session_id,
                    createdAt: m.timestamp,
                    sys: m.sys,
                    dia: m.dia,
                    puls: m.puls
                }))
            ));
        }
        return sessions;
    }
}
