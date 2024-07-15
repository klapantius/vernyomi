export class Measurement {
    measurement_id: number | null; // null when not yet saved to DB
    session_id: number;
    created_at: Date;
    sys: number;
    dia: number;
    pulse: number;

    constructor(measurement_id: number | null, session_id: number, created_at: Date, sys: number, dia: number, pulse: number) {
        this.measurement_id = measurement_id;
        this.session_id = session_id;
        this.created_at = created_at;
        this.sys = sys;
        this.dia = dia;
        this.pulse = pulse;
    }
}