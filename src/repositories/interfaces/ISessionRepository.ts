import { SessionCreationSource } from '../../models/SessionCreationSource';

export interface ISessionRepository {
    createSessionAsync(creationSource: SessionCreationSource, comment?: string, createAt?: Date): Promise<number>;
}