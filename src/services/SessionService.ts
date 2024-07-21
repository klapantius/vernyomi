import { myContainer } from '../inversify.config';
import { DITokens } from '../inversify.tokens';
import { SessionCreationSource } from '../models/SessionCreationSource';
import { ISessionRepository } from '../repositories/interfaces/ISessionRepository';

export class SessionService {
    sessionRepository: ISessionRepository;

    constructor() {
        this.sessionRepository = myContainer.get<ISessionRepository>(DITokens.SessionRepository);
    }

    public async createSessionAsync(creationSource: SessionCreationSource): Promise<number> {
        const result = await this.sessionRepository.createSessionAsync(creationSource);
        return result;
    }
}