import { myContainer } from '../inversify.config';
import { Measurement } from '../models/Measurement';
import { SessionCreationSource } from '../models/SessionCreationSource';
import { IMeasurementRepository } from '../repositories/interfaces/IMeasurementRepository';
import { ISessionRepository } from '../repositories/interfaces/ISessionRepository';

export class SessionService {
    sessionRepository: ISessionRepository;

    constructor() {
        this.sessionRepository = myContainer.get<ISessionRepository>('ISessionRepository');
    }

    public async createSessionAsync(creationSource: SessionCreationSource): Promise<number> {
        const result = await this.sessionRepository.createSessionAsync(creationSource);
        return result;
    }
}

export class MeasurementService { // TODO: this doesn't belong here
    measurementRepository: IMeasurementRepository;

    constructor() {
        this.measurementRepository = myContainer.get<IMeasurementRepository>('IMeasurementRepository');
    }

    public async saveMeasurementAsync(data: Measurement | { sessionId: string, sys: string, dia: string, puls: string, comment?: string }): Promise<void> {
        let measurement: Measurement;

        if (data instanceof Measurement) {
            measurement = data;
        } else {
            measurement = new Measurement({
                measurementId: null,
                sessionId: +data.sessionId,
                createdAt: new Date(),
                sys: +data.sys,
                dia: +data.dia,
                puls: +data.puls
                //, data.comment);
            });
        }

        await this.measurementRepository.save(measurement);
        return;
    }
}
