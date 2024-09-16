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

    async updateMeasurement(measurementData: any): Promise<{ message: string }> {
        await this.repo.update(new Measurement(measurementData));
        return { message: 'Measurement updated successfully' };
    }

    async deleteMeasurement(measurementId: number): Promise<{ message: string }> {
        await this.repo.delete(measurementId);
        return { message: 'Measurement deleted successfully' };
    }
}