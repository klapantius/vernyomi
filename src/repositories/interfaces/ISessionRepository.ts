import { Session } from '../../models/Session';

export interface ISessionRepository {
    save(session: Session): Promise<Session>;
}