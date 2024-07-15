import { IDatabase } from '../../database/IDatabase'; // Import the correct type 'IDatabase'
import { Session } from '../../models/Session'; // Import the correct type 'Session'

class SessionRepository {
    private db: IDatabase;

    constructor(db: IDatabase) {
        this.db = db;
    }

    async save(session: Session): Promise<Session> {
        throw new Error('Not implemented yet'); // Implement this method
        // Use this.db.query(...) to interact with the database
    }
}
