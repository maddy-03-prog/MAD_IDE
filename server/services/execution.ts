import { type ExecutionResult } from "@shared/schema";

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

export const SUPPORTED_LANGUAGES = [
    "python",
    "javascript",
    "c",
    "cpp",
    "java",
    "sql"
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const LANGUAGE_CONFIG: Record<string, { language: string, version: string, filename: string }> = {
    python: { language: "python", version: "*", filename: "main.py" },
    javascript: { language: "javascript", version: "*", filename: "index.js" },
    c: { language: "c", version: "10.2.0", filename: "main.c" },
    cpp: { language: "cpp", version: "10.2.0", filename: "main.cpp" },
    java: { language: "java", version: "*", filename: "Main.java" },
    sql: { language: "sqlite3", version: "*", filename: "script.sql" },
};

// Minimal preamble for SQL to ensure a better user experience (Demo Tables)
// This is strictly for the 'demo' feel of SQL without mocking the *execution* itself.
const SQL_PREAMBLE = `
-- Mad IDE: Demo Database
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, role TEXT);
INSERT INTO users (name, role) VALUES ('Admin', 'Administrator'), ('Guest', 'Visitor');
CREATE TABLE logs (id INTEGER PRIMARY KEY, message TEXT);
INSERT INTO logs (message) VALUES ('System initialized'), ('User logged in');
-- User Query:
`;

export async function executeCodeInSandbox(
    language: string,
    code: string,
    input: string = ""
): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
        // 1. Validate Language
        if (!LANGUAGE_CONFIG[language]) {
            throw new Error(`Language '${language}' is not supported.`);
        }

        const config = LANGUAGE_CONFIG[language];

        // 2. Prepare Code and Filename
        let filename = config.filename;
        let codeToExecute = code;

        // Java: Extract class name to match filename
        if (language === "java") {
            const match = code.match(/public\s+class\s+(\w+)/);
            if (match) {
                filename = `${match[1]}.java`;
            }
        }

        // SQL: Prepend the demo database structure
        if (language === "sql") {
            codeToExecute = `${SQL_PREAMBLE}\n${code}`;
        }

        // 3. Construct Piston Payload
        // CRITICAL: 'stdin' is passed directly. 
        // Piston writes this string to the process's standard input stream.
        const payload = {
            language: config.language,
            version: config.version,
            files: [{
                name: filename,
                content: codeToExecute
            }],
            stdin: input, // Direct User Input -> STDIN
            run_timeout: 3000,
            compile_timeout: 10000
        };

        // 4. API Call
        const response = await fetch(PISTON_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Execution Service Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        // 5. Output Formatting
        // Piston returns: { run: { stdout, stderr, code, signal } }
        let output = result.run.stdout || "";
        const error = result.run.stderr || "";

        // Clean up SQL output to hide preamble execution confirmation if any
        if (language === "sql") {
            // No specific cleanup needed usually for sqlite3 unless verbose
        }

        return {
            output: output,
            error: error,
            exitCode: result.run.code || 0,
            executionTime: Date.now() - startTime
        };

    } catch (error: any) {
        console.error(`[Execution Failed] ${language}:`, error);
        return {
            output: "",
            error: error.message || "Unknown Execution Error",
            exitCode: 1,
            executionTime: Date.now() - startTime
        };
    }
}

export function validateSqlSafety(query: string): boolean {
    // Block destructive commands for the demo environment
    const forbidden = /DROP|ALTER|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX|RENAME/i;
    // Allow SELECT, INSERT, UPDATE, DELETE, CREATE (for temp tables)
    return !forbidden.test(query);
}
