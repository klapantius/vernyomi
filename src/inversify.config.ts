import { Container } from "inversify";
import "reflect-metadata";
import { IDatabase } from "./services/database/IDatabase";
import { MariaDBDatabase } from "./services/database/MariaDBDatabase";
import { ISessionRepository } from "./repositories/interfaces/ISessionRepository";
import { IMeasurementRepository } from "./repositories/interfaces/IMeasurementRepository";
import { SessionRepository } from "./repositories/implementations/SessionRepository";
import { MeasurementRepository } from "./repositories/implementations/MeasurementRepository";
import { DITokens } from "./inversify.tokens";

const myContainer = new Container();
myContainer.bind<IDatabase>(DITokens.DatabaseService).to(MariaDBDatabase);
myContainer.bind<ISessionRepository>(DITokens.SessionRepository).to(SessionRepository);
myContainer.bind<IMeasurementRepository>(DITokens.MeasurementRepository).to(MeasurementRepository);

export { myContainer };