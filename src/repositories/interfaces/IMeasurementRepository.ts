import { Measurement } from "../../models/Measurement";

export interface IMeasurementRepository {
    save(measurement: Measurement): Promise<number>;
}