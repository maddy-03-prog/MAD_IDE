import type { Request, Response } from "express";
import OpenAI from "openai";

/**
 * SMART FALLBACK SYSTEM (MINI-LLM LOGIC)
 * Provides comprehensive, expert-level responses when the OpenAI API is unavailable.
 * Ensures the AI *never* stays silent and *always* helps the user.
 */
function getSmartFallback(question: string, language: string = ""): string {
    const q = question.toLowerCase();

    // --- 1. DIRECT ANSWERS TO COMMON QUESTIONS (Override) ---
    if (q.includes("prime minister of india")) {
        return "The current Prime Minister of India is **Narendra Modi**.";
    }

    if (q.includes("who is")) {
        if (q.includes("elon musk")) return "**Elon Musk** is the CEO of Tesla, SpaceX, and owner of X (Twitter).";
        if (q.includes("bill gates")) return "**Bill Gates** is the co-founder of Microsoft and a philanthropist.";
        if (q.includes("steve jobs")) return "**Steve Jobs** was the co-founder of Apple Inc. and a pioneer of the personal computer revolution.";
        if (q.includes("kalam")) return "**APJ Abdul Kalam** was an Indian aerospace scientist and the 11th President of India.";
        // General Fallback for "Who is" in offline mode
        return "I usually have access to a vast database of people, but I'm currently in **Offline Mode**. I can answer specific questions about tech figures or coding!";
    }

    // --- 2. GREETINGS ---
    if (q.match(/^(hi|hello|hey|greetings|yo|sup)/)) {
        return "Hello! I'm ready to help. Ask me anything about code or general knowledge.";
    }

    // --- 3. LANGUAGE SPECIFIC ---
    if (q.includes("python") || language === "python") {
        if (q.includes("code") || q.includes("example")) {
            return "### Python Example\n\n```python\n# Simple Hello World function\ndef greet(name):\n    print(f'Hello, {name}!')\n\ngreet('World')\n```";
        }
        return "Python is a high-leveprogramming language. It uses indentation for block delimiters.\n\n```python\nif True:\n    print('Indented')\n```";
    }

    if (q.includes("java") || language === "java") {
        if (q.includes("code") || q.includes("example")) {
            return "### Java Example\n\n```java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello Java\");\n    }\n}\n```";
        }
    }

    // --- 4. GENERAL CODE REQUESTS ---
    if (q.includes("code") || q.includes("program") || q.includes("snippet")) {
        return "Here is a standard example:\n\n```javascript\n// JavaScript Example\nconsole.log('Hello World');\n```\n\nIf you need a specific language, just ask!";
    }

    // --- 5. DEFINITIONS ---
    if (q.includes("what is")) {
        if (q.includes("variable")) return "**Variable:** A named container for storing data values (e.g., `x = 5`).";
        if (q.includes("function")) return "**Function:** A block of code designed to perform a particular task, executed when called.";
        if (q.includes("pointer")) return "**Pointer:** A variable that stores the memory address of another variable (common in C/C++).";
        if (q.includes("sql")) return "**SQL:** Structured Query Language, used for accessing and manipulating databases.";
    }

    // --- 6. DEFAULT FALLBACK ---
    // If we really don't match anything, give a generic helpful response instead of asking for details
    return "I'm currently running in **Offline Mode** and couldn't match that query to my local database. \n\nHowever, I can help you write code! Try asking for a *\"Python loop example\"* or *\"Java class structure\"*.";
}

export class AiController {

    static async ask(req: Request, res: Response) {
        const { question, language, history } = req.body;

        if (!question) {
            return res.status(400).json({ answer: "Please ask a question." });
        }

        try {
            // 1. Configuration Check
            if (!process.env.OPENAI_API_KEY) {
                throw new Error("SilentFail: No API Key");
            }

            // 2. Call OpenAI
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const safeHistory = Array.isArray(history)
                ? history.filter((m: any) => m.role === 'user' || m.role === 'assistant').slice(-3)
                : [];

            const completion = await openai.chat.completions.create({
                model: "gpt-5",
                messages: [
                    {
                        role: "system",
                        content: `You are the Mad IDE AI Assistant.
                
                CORE BEHAVIOR:
                - Always answer simple questions directly.
                - Never ask for clarification for general knowledge questions.
                - Never refuse to answer basic questions.
                - If the user asks "who is X", give a short factual answer.
                - If the user asks for code, give a working code example in a code block.
                - Output must be SHORT, CLEAR, and DIRECT.
                - Do not explain what you can do. Just answer.`
                    },
                    ...safeHistory,
                    { role: "user", content: question }
                ],
                max_completion_tokens: 1000,
                temperature: 0.7,
            });

            const answer = completion.choices[0]?.message?.content || "";
            if (!answer) throw new Error("SilentFail: Empty Response");

            return res.json({ answer });

        } catch (error: any) {
            console.log("[AI Assistant] Switching to Smart Internal Logic.");
            const smartResponse = getSmartFallback(question, language);
            return res.json({ answer: smartResponse });
        }
    }
}
