import { SessionCreationSource } from "./SessionCreationSource";

export class Session {
    sessionId: number | null; // null when not yet saved to DB
    startedAt: Date;
    creationSource: SessionCreationSource; // Step 2: Add the new property

    constructor(sessionId: number | null, startedAt: Date, creationSource: SessionCreationSource) {
        this.sessionId = sessionId;
        this.startedAt = startedAt;
        this.creationSource = creationSource; // Initialize the new property
    }
}