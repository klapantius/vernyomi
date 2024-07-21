import { SessionCreationSource } from "./SessionCreationSource";

export class Session {
    sessionId: number | null; // null when not yet saved to DB
    startedAt: Date;
    comment: string;
    creationSource: SessionCreationSource; // Step 2: Add the new property

    constructor(sessionId: number | null, startedAt: Date, comment: string, creationSource: SessionCreationSource) {
        this.sessionId = sessionId;
        this.startedAt = startedAt;
        this.comment = comment;
        this.creationSource = creationSource; // Initialize the new property
    }
}