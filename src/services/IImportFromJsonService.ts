import { BackupEntry } from "../models/BackupEntry";

export interface IImportFromJsonService {
    loadAsync(): Promise<void>;
    loadAndGroupAsync(): Promise<BackupEntry[][]>;
    saveToDatabase(): Promise<void>;
 }
