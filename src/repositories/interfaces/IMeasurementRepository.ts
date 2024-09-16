import { Measurement } from "../../models/Measurement";

export interface IMeasurementRepository {
    create(measurement: Measurement): Promise<number>;
    update(measurement: Measurement): Promise<void>;
    delete(measurementId: number): Promise<void>;
}