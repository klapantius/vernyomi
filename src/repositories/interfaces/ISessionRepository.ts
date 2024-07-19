import { DatabaseWriteOperationResult } from '../../database/IDatabase';
import { Session } from '../../models/Session';

export interface ISessionRepository {
    createSessionAsync(): Promise<number>;
    save(session: Session): Promise<DatabaseWriteOperationResult>;
}