import { BloodPressureEntry } from "./ImportFromJsonService";

export interface IImportFromJsonService {
    loadAsync(): Promise<void>;
    loadAndGroupAsync(): Promise<BloodPressureEntry[][]>;
    saveToDatabase(): Promise<void>;
 }
