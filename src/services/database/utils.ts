// utils.ts

// Function to safely serialize BigInt values from MariaDB
export function serializeBigInt(value: bigint): string | number {
    // Check if the value is within the safe integer range
    if (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER) {
        // Convert to number if within the safe range
        return Number(value);
    } else {
        // Convert to string if outside the safe range to avoid precision loss
        return value.toString();
    }
}

// get a date string in the format 'YYYY-MM-DD HH:MM'
export function GetDateString(date?: Date): string {
    if (!date) { date = new Date() };
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// Export other functions as needed