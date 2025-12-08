import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const codeFiles = pgTable("code_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  language: text("language").notNull(),
  content: text("content").notNull().default(""),
});

export const insertCodeFileSchema = createInsertSchema(codeFiles).omit({
  id: true,
});

export type InsertCodeFile = z.infer<typeof insertCodeFileSchema>;
export type CodeFile = typeof codeFiles.$inferSelect;

export const supportedLanguages = ["python", "c", "cpp", "java", "sql"] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

export const executeCodeSchema = z.object({
  code: z.string(),
  language: z.enum(supportedLanguages),
  input: z.string().optional(),
});

export type ExecuteCodeRequest = z.infer<typeof executeCodeSchema>;

export type ExecutionResult = {
  output: string;
  error: string;
  exitCode: number;
  executionTime: number;
};

export const languageConfig: Record<SupportedLanguage, {
  name: string;
  extension: string;
  description: string;
  defaultCode: string;
}> = {
  python: {
    name: "Python",
    extension: ".py",
    description: "Simple, versatile, and powerful.",
    defaultCode: `# Welcome to MAD IDE - Python
print("Hello, World!")
`,
  },
  c: {
    name: "C",
    extension: ".c",
    description: "The mother of all languages.",
    defaultCode: `// Welcome to MAD IDE - C
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
`,
  },
  cpp: {
    name: "C++",
    extension: ".cpp",
    description: "High performance and control.",
    defaultCode: `// Welcome to MAD IDE - C++
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,
  },
  java: {
    name: "Java",
    extension: ".java",
    description: "Write once, run anywhere.",
    defaultCode: `// Welcome to MAD IDE - Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`,
  },
  sql: {
    name: "SQL",
    extension: ".sql",
    description: "Master your data universe.",
    defaultCode: `-- Welcome to MAD IDE - SQL
SELECT 'Hello, World!' AS greeting;
`,
  },
};
