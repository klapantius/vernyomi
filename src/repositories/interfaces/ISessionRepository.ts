import { ComplexSession } from '../../models/ComplexSession';
import { SessionCreationSource } from '../../models/SessionCreationSource';

export interface ISessionRepository {
    getSessions(limit: number): Promise<ComplexSession[] | null>;
    createSessionAsync(creationSource: SessionCreationSource, comment?: string, createAt?: Date): Promise<number>;
}