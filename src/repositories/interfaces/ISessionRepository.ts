import { SessionCreationSource } from '../../models/SessionCreationSource';

export interface ISessionRepository {
    createSessionAsync(creationSource: SessionCreationSource, comment?: string): Promise<number>;
}