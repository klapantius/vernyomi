export class Measurement {
    measurementId: number | null; // null when not yet saved to DB
    sessionId: number | null;
    createdAt: Date;
    sys: number;
    dia: number;
    puls: number;

    constructor({ measurementId, sessionId, createdAt, sys, dia, pulse }: { 
        measurementId: number | null, 
        sessionId: number | null,
        createdAt: Date | null, 
        sys: number, 
        dia: number, 
        pulse: number 
    }) {
        if (sessionId === null) {
            throw new Error("sessionId must not be null");
        }
        if (sessionId <= 0) {
            throw new Error(`invalid sessionId ${sessionId}`);
        }
        if (createdAt === null) {
            createdAt = new Date();
        }
        this.measurementId = measurementId;
        this.sessionId = sessionId;
        this.createdAt = createdAt;
        this.sys = sys;
        this.dia = dia;
        this.puls = pulse;
    }
}