export class Measurement {
    measurementId: number | null; // null when not yet saved to DB
    sessionId: number;
    createdAt: Date;
    sys: number;
    dia: number;
    puls: number;

    constructor({ measurementId, sessionId, createdAt, sys, dia, puls }: { 
        measurementId?: number | null, 
        sessionId?: number | null | undefined,
        createdAt?: Date, 
        sys: number, 
        dia: number, 
        puls: number 
    } = { sys: 0, dia: 0, puls: 0 }) {
        if (sessionId === null) {
            throw new Error("sessionId must not be null");
        }
        if ((sessionId ?? 0) <= 0) {
            throw new Error(`invalid sessionId: ${sessionId}`);
        }
        if (measurementId === undefined) { measurementId = null; }
        this.measurementId = measurementId;
        this.sessionId = sessionId ?? 0; // fallback to 0 should never happen because of the sanity checks above
        this.createdAt = createdAt ?? new Date();
        this.sys = sys;
        this.dia = dia;
        this.puls = puls;
    }
}