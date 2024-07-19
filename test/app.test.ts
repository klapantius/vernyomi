import express from 'express';
import request from 'supertest';
import { myContainer } from "../src/inversify.config";
import { IDatabase } from '../src/database/IDatabase';
import { ISessionRepository } from '../src/repositories/interfaces/ISessionRepository';
import { IMeasurementRepository } from '../src/repositories/interfaces/IMeasurementRepository';
import { Application } from '../src/app';

describe('Application', () => {
    let app: express.Application;
    let database: IDatabase;
    let sessionRepository: ISessionRepository;
    let measurementRepository: IMeasurementRepository;

    beforeEach(() => {
        if (process.env.JEST_DEBUG) {
            // Jest is running in a debugger
            jest.setTimeout(100000); // Set a higher timeout
        } else {
            // Jest is not running in a debugger
            jest.setTimeout(5000); // Set a standard timeout
        }
        app = express();
        database = {
            warmup: jest.fn().mockResolvedValue(undefined),
            query: jest.fn().mockResolvedValue([])
        };
        sessionRepository = {
            createSessionAsync: jest.fn().mockResolvedValue(1),
            save: jest.fn().mockResolvedValue(undefined)
        };
        measurementRepository = {
            save: jest.fn().mockResolvedValue(undefined)
        };
        myContainer.unbind('IDatabase');
        myContainer.bind<IDatabase>('IDatabase').toConstantValue(database);
        myContainer.unbind('ISessionRepository');
        myContainer.bind<ISessionRepository>('ISessionRepository').toConstantValue(sessionRepository);
        myContainer.unbind('IMeasurementRepository');
        myContainer.bind<IMeasurementRepository>('IMeasurementRepository').toConstantValue(measurementRepository);
    });

    it('should setup the server and handle routes correctly', async () => {
        const application = new Application();
        application.app = app;
        application.setupServer();

        const startSessionResponse = await request(app).post('/start-session');
        expect(startSessionResponse.status).toBe(200);
        expect(startSessionResponse.body).toEqual({
            sessionId: 1,
            message: 'Session started successfully'
        });
        expect(sessionRepository.createSessionAsync).toHaveBeenCalled();

        const saveMeasurementResponse = await request(app).post('/save-measurement').send({
            sessionId: 42,
            sys: 120,
            dia: 80,
            puls: 70
        });
        expect(saveMeasurementResponse.status).toBe(200);
        expect(saveMeasurementResponse.body).toEqual({
            message: 'Measurement saved successfully'
        });
        expect(measurementRepository.save).toHaveBeenCalledWith({
            sessionId: 42,
            measurementId: null,
            createdAt: expect.any(Date),
            sys: 120,
            dia: 80,
            puls: 70
        });
    });
});