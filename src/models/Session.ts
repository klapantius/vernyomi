export class Session {
    session_id: number | null; // null when not yet saved to DB
    started_at: Date;

    constructor(session_id: number | null, started_at: Date) {
        this.session_id = session_id;
        this.started_at = started_at;
    }
}