import { Container } from "inversify";
import "reflect-metadata";
import { IDatabase } from "./database/IDatabase";
import { MariaDBDatabase } from "./database/MariaDBDatabase";
import { ISessionRepository } from "./repositories/interfaces/ISessionRepository";
import { IMeasurementRepository } from "./repositories/interfaces/IMeasurementRepository";
import { SessionRepository } from "./repositories/implementations/SessionRepository";
import { MeasurementRepository } from "./repositories/implementations/MeasurementRepository";

const myContainer = new Container();
myContainer.bind<IDatabase>("IDatabase").to(MariaDBDatabase);
myContainer.bind<ISessionRepository>("ISessionRepository").to(SessionRepository);
myContainer.bind<IMeasurementRepository>("IMeasurementRepository").to(MeasurementRepository);

export { myContainer };