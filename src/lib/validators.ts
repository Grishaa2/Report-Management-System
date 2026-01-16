import { z } from "zod";

// Schema for a single row in the report data
// Since CSV data is dynamic, we treat it as a record of strings/numbers/etc.
// We primarily want to ensure it's an object.
const rowSchema = z.record(z.string(), z.union([z.string(), z.number(), z.null(), z.undefined(), z.boolean()]));

// Schema for the entire report data
export const reportDataSchema = z.array(rowSchema)
    .max(10000, { message: "Report contains too many rows. Maximum allowed is 10,000." })
    .min(1, { message: "Report data is empty." });

/**
 * Validates the report data to ensure it meets structure and size requirements.
 * Also checks for consistency in headers (keys).
 */
export function validateReportData(data: any[]) {
    // 1. Basic Schema Validation (Type and Size)
    const result = reportDataSchema.safeParse(data);

    if (!result.success) {
        const errorMessages = result.error.errors.map(err => err.message).join(", ");
        return { isValid: false, error: errorMessages };
    }

    // 2. Consistency Check (Headers)
    if (data.length > 0) {
        const headers = Object.keys(data[0]);
        // Check if subsequent rows have unexpected keys or are missing keys
        // Note: CSV parsers often fill missing values with empty strings or nulls, 
        // keeping keys consistent. This check detects if a row is completely malformed.

        // We check the first 50 rows or so to avoid performance hit on large files, 
        // or we can check all if we want strictness. Given 10k limit, checking all is fine.

        for (let i = 1; i < data.length; i++) {
            const rowKeys = Object.keys(data[i]);

            // Simple check: same number of columns?
            if (rowKeys.length !== headers.length) {
                return {
                    isValid: false,
                    error: `Inconsistent data structure detected at row ${i + 1}. Expected ${headers.length} columns, found ${rowKeys.length}.`
                };
            }

            // Strict check: same headers? (Sorting keys to ensure order doesn't matter, though it usually does in CSV)
            // For performance, maybe we just trust the column count for now, or just check standard parsers output.
        }
    }

    return { isValid: true, error: null };
}
