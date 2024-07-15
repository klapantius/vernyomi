import { DatabaseWriteOperationResult, IDatabase } from '../../database/IDatabase'; // Import the correct type 'IDatabase'
import { Session } from '../../models/Session'; // Import the correct type 'Session'
import { injectable } from "inversify";

@injectable()
export class SessionRepository {
    private db: IDatabase;

    constructor(db: IDatabase) {
        this.db = db;
    }

    async save(session: Session): Promise<DatabaseWriteOperationResult> {
        return await this.db.query('INSERT INTO sessions (timestamp) VALUES (?)', [session.startedAt]);
    }
}
