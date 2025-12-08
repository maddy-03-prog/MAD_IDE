import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { executeCodeSchema, type ExecutionResult, type SupportedLanguage } from "@shared/schema";
import { exec, spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import os from "os";

const EXECUTION_TIMEOUT = 10000; // 10 seconds
const MAX_OUTPUT_SIZE = 50000; // 50KB

async function executeCode(
  code: string,
  language: SupportedLanguage,
  input?: string
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const tempDir = path.join(os.tmpdir(), `mad-ide-${randomUUID()}`);
  
  try {
    await fs.mkdir(tempDir, { recursive: true });
    
    let result: ExecutionResult;
    
    switch (language) {
      case "python":
        result = await executePython(tempDir, code, input);
        break;
      case "c":
        result = await executeC(tempDir, code, input);
        break;
      case "cpp":
        result = await executeCpp(tempDir, code, input);
        break;
      case "java":
        result = await executeJava(tempDir, code, input);
        break;
      case "sql":
        result = await executeSql(tempDir, code);
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
    
    result.executionTime = Date.now() - startTime;
    return result;
  } finally {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

async function runCommand(
  command: string,
  args: string[],
  cwd: string,
  input?: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      timeout: EXECUTION_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    });
    
    let stdout = "";
    let stderr = "";
    let killed = false;
    
    const timeout = setTimeout(() => {
      killed = true;
      child.kill("SIGKILL");
    }, EXECUTION_TIMEOUT);
    
    child.stdout.on("data", (data) => {
      stdout += data.toString();
      if (stdout.length > MAX_OUTPUT_SIZE) {
        stdout = stdout.substring(0, MAX_OUTPUT_SIZE) + "\n[Output truncated...]";
        child.kill("SIGKILL");
      }
    });
    
    child.stderr.on("data", (data) => {
      stderr += data.toString();
      if (stderr.length > MAX_OUTPUT_SIZE) {
        stderr = stderr.substring(0, MAX_OUTPUT_SIZE) + "\n[Error output truncated...]";
        child.kill("SIGKILL");
      }
    });
    
    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
    
    child.on("close", (exitCode) => {
      clearTimeout(timeout);
      if (killed) {
        resolve({
          stdout,
          stderr: stderr + "\nExecution timed out (10 second limit)",
          exitCode: 1,
        });
      } else {
        resolve({
          stdout,
          stderr,
          exitCode: exitCode ?? 1,
        });
      }
    });
    
    child.on("error", (err) => {
      clearTimeout(timeout);
      resolve({
        stdout: "",
        stderr: `Failed to execute: ${err.message}`,
        exitCode: 1,
      });
    });
  });
}

async function executePython(
  tempDir: string,
  code: string,
  input?: string
): Promise<ExecutionResult> {
  const filePath = path.join(tempDir, "main.py");
  await fs.writeFile(filePath, code);
  
  const result = await runCommand("python3", [filePath], tempDir, input);
  
  return {
    output: result.stdout,
    error: result.stderr,
    exitCode: result.exitCode,
    executionTime: 0,
  };
}

async function executeC(
  tempDir: string,
  code: string,
  input?: string
): Promise<ExecutionResult> {
  const sourcePath = path.join(tempDir, "main.c");
  const outputPath = path.join(tempDir, "main");
  await fs.writeFile(sourcePath, code);
  
  // Compile
  const compileResult = await runCommand("gcc", [sourcePath, "-o", outputPath, "-lm"], tempDir);
  if (compileResult.exitCode !== 0) {
    return {
      output: "",
      error: compileResult.stderr || compileResult.stdout,
      exitCode: compileResult.exitCode,
      executionTime: 0,
    };
  }
  
  // Run
  const runResult = await runCommand(outputPath, [], tempDir, input);
  
  return {
    output: runResult.stdout,
    error: runResult.stderr,
    exitCode: runResult.exitCode,
    executionTime: 0,
  };
}

async function executeCpp(
  tempDir: string,
  code: string,
  input?: string
): Promise<ExecutionResult> {
  const sourcePath = path.join(tempDir, "main.cpp");
  const outputPath = path.join(tempDir, "main");
  await fs.writeFile(sourcePath, code);
  
  // Compile
  const compileResult = await runCommand("g++", [sourcePath, "-o", outputPath, "-lm"], tempDir);
  if (compileResult.exitCode !== 0) {
    return {
      output: "",
      error: compileResult.stderr || compileResult.stdout,
      exitCode: compileResult.exitCode,
      executionTime: 0,
    };
  }
  
  // Run
  const runResult = await runCommand(outputPath, [], tempDir, input);
  
  return {
    output: runResult.stdout,
    error: runResult.stderr,
    exitCode: runResult.exitCode,
    executionTime: 0,
  };
}

async function executeJava(
  tempDir: string,
  code: string,
  input?: string
): Promise<ExecutionResult> {
  // Extract class name from code
  const classNameMatch = code.match(/public\s+class\s+(\w+)/);
  const className = classNameMatch ? classNameMatch[1] : "Main";
  
  const sourcePath = path.join(tempDir, `${className}.java`);
  await fs.writeFile(sourcePath, code);
  
  // Compile
  const compileResult = await runCommand("javac", [sourcePath], tempDir);
  if (compileResult.exitCode !== 0) {
    return {
      output: "",
      error: compileResult.stderr || compileResult.stdout,
      exitCode: compileResult.exitCode,
      executionTime: 0,
    };
  }
  
  // Run
  const runResult = await runCommand("java", ["-cp", tempDir, className], tempDir, input);
  
  return {
    output: runResult.stdout,
    error: runResult.stderr,
    exitCode: runResult.exitCode,
    executionTime: 0,
  };
}

async function executeSql(
  tempDir: string,
  code: string
): Promise<ExecutionResult> {
  const dbPath = path.join(tempDir, "database.db");
  
  // Execute SQL using sqlite3 by passing code via stdin
  const result = await runCommand(
    "sqlite3",
    ["-header", "-column", dbPath],
    tempDir,
    code
  );
  
  return {
    output: result.stdout || "Query executed successfully.",
    error: result.stderr,
    exitCode: result.exitCode,
    executionTime: 0,
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Code execution endpoint
  app.post("/api/execute", async (req, res) => {
    try {
      const parseResult = executeCodeSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({
          output: "",
          error: "Invalid request: " + parseResult.error.message,
          exitCode: 1,
          executionTime: 0,
        });
      }
      
      const { code, language, input } = parseResult.data;
      
      if (!code.trim()) {
        return res.status(400).json({
          output: "",
          error: "No code provided",
          exitCode: 1,
          executionTime: 0,
        });
      }
      
      const result = await executeCode(code, language, input);
      res.json(result);
    } catch (error: any) {
      console.error("Execution error:", error);
      res.status(500).json({
        output: "",
        error: error.message || "Internal server error",
        exitCode: 1,
        executionTime: 0,
      });
    }
  });

  return httpServer;
}
