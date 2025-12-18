import type { Request, Response } from "express";
import { executeCodeInSandbox, validateSqlSafety } from "../services/execution";

export class RunController {

    static async execute(req: Request, res: Response) {
        const language = req.params.language;
        // CRITICAL: Ensure 'input' is captured from the body.
        // If input is undefined/null, default to empty string "".
        const { code, input } = req.body;

        // 1. Input Validation
        if (!code) {
            return res.status(400).json({
                output: "",
                error: "Code is required",
                executionTime: 0
            });
        }

        // 2. Output Payload (Standardized)
        let executionResult = {
            output: "",
            error: "",
            exitCode: 0,
            executionTime: 0
        };

        try {
            // 3. Special Checks
            if (language === 'sql' && !validateSqlSafety(code)) {
                throw new Error("Security Error: Destructive SQL commands are not allowed.");
            }

            // 4. Execute Code (Passing Input)
            executionResult = await executeCodeInSandbox(language, code, input || "");

        } catch (error: any) {
            console.error(`[RunController] Error executing ${language}:`, error);
            executionResult.error = error.message || "Internal Server Error";
            executionResult.exitCode = 1;
        }

        // 5. Return JSON (Always 200 OK unless bad request structure)
        // We return execution errors in the JSON body, not as HTTP 500
        res.json(executionResult);
    }
}
