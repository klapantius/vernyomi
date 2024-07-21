// this must be out of inverisfy.config.ts to avoid circular dependencies

export const DITokens = {
    DatabaseService: Symbol.for('IDatabase'),
    SessionRepository: Symbol.for('ISessionRepository'),
    MeasurementRepository: Symbol.for('IMeasurementRepository'),
};