import { DatabaseWriteOperationResult } from '../../database/IDatabase';
import { Session } from '../../models/Session';

export interface ISessionRepository {
    save(session: Session): Promise<DatabaseWriteOperationResult>;
}