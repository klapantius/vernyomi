import { Session } from "./Session";
import { Measurement } from "./Measurement";
import { SessionCreationSource } from "./SessionCreationSource";

export class ComplexSession extends Session {
    measurements: Measurement[] = [];

    constructor(
        sessionId: number,
        startedAt: Date,
        comment: string,
        creationSource: SessionCreationSource,
        measurements: Measurement[]) {

        super(sessionId, startedAt, comment, creationSource);
        this.measurements = measurements;
    }
}