import fs from 'fs';

interface BloodPressureEntry {
	date: string; // Assuming format YYYY-MM-DD
	time: string; // Assuming format HH:MM
	sys: number;
	dia: number;
	puls: number;
	comment?: string;
}

export class GroupedBloodPressureLog {
    public entries: BloodPressureEntry[] = [];
    private timeSpan: number; // Time span in minutes

    constructor(private filePath: string, timeSpan: number) {
        this.timeSpan = timeSpan;
        // this.loadEntries(); // Note: Not awaiting here, consider handling initialization asynchronously
    }

    async loadEntries(): Promise<void> {
        try {
            const data = await fs.promises.readFile(this.filePath, 'utf8');
            const json = JSON.parse(data);
            this.entries = json.entries as BloodPressureEntry[];
        } catch (error) {
            console.error(`Failed to load entries from ${this.filePath}:`, error);
        }
    }

    private entryToTimestamp(entry: BloodPressureEntry): number {
        const [year, month, day] = entry.date.split('.').map(Number);
        const [hour, minute] = entry.time.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute).getTime();
    }

    async groupEntries(): Promise<BloodPressureEntry[][]> {
        await this.loadEntries(); // Ensure entries are loaded
        const sortedEntries = this.entries.sort((a, b) => this.entryToTimestamp(a) - this.entryToTimestamp(b));
        const groups: BloodPressureEntry[][] = [];
        let currentGroup: BloodPressureEntry[] = [];

        sortedEntries.forEach((entry, index) => {
            if (index === 0) {
                currentGroup.push(entry);
            } else {
                const previousEntry = sortedEntries[index - 1];
                const diff = (this.entryToTimestamp(entry) - this.entryToTimestamp(previousEntry)) / 60000; // Difference in minutes
                if (diff <= this.timeSpan) {
                    currentGroup.push(entry);
                } else {
                    groups.push(currentGroup);
                    currentGroup = [entry];
                }
            }
        });

        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }

        return groups;
    }
}
