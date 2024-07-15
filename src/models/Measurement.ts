export class Measurement {
    measurementId: number | null; // null when not yet saved to DB
    sessionId: number | null;
    createdAt: Date;
    sys: number;
    dia: number;
    pulse: number;

    constructor(measurementId: number | null, sessionId: number | null, createdAt: Date, sys: number, dia: number, pulse: number) {
        this.measurementId = measurementId;
        this.sessionId = sessionId;
        this.createdAt = createdAt;
        this.sys = sys;
        this.dia = dia;
        this.pulse = pulse;
    }
}