import { ISessionRepository } from '../repositories/interfaces/ISessionRepository';
import { IMeasurementRepository } from '../repositories/interfaces/IMeasurementRepository';
import { Session } from '../models/Session';
import { Measurement } from '../models/Measurement';

class DataService {
    private sessionRepository: ISessionRepository;
    private measurementRepository: IMeasurementRepository;

    constructor(sessionRepo: ISessionRepository, measurementRepo: IMeasurementRepository) {
        this.sessionRepository = sessionRepo;
        this.measurementRepository = measurementRepo;
    }

    async saveSession(session: Session): Promise<Session> {
        return this.sessionRepository.save(session);
    }

    async saveMeasurement(measurement: Measurement): Promise<Measurement> {
        return this.measurementRepository.save(measurement);
    }
}