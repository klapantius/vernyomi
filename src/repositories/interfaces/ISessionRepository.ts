import { SessionCreationSource } from '../../models/SessionCreationSource';

export interface ISessionRepository {
    createSessionAsync(creationSource: SessionCreationSource): Promise<number>;
}