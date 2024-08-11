// MeasurementService.ts
import { IMeasurementRepository } from '../repositories/interfaces/IMeasurementRepository';
import { Measurement } from '../models/Measurement';

export class MeasurementService {
    private repo: IMeasurementRepository;

    constructor(repo: IMeasurementRepository) {
        this.repo = repo;
    }

    async saveMeasurement(measurementData: any): Promise<{ message: string }> {
        await this.repo.create(new Measurement(measurementData));
        return { message: 'Measurement saved successfully' };
    }
}