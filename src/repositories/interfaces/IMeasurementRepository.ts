import { Measurement } from "../../models/Measurement";

export interface IMeasurementRepository {
    create(measurement: Measurement): Promise<number>;
}