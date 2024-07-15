export class Session {
    sessionId: number | null; // null when not yet saved to DB
    startedAt: Date;

    constructor(sessionId: number | null, startedAt: Date) {
        this.sessionId = sessionId;
        this.startedAt = startedAt;
    }
}