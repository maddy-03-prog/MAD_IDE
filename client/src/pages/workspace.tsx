import { useState, useCallback, useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  languageConfig, 
  type SupportedLanguage, 
  type ExecutionResult 
} from "@shared/schema";
import { 
  Play, 
  Square, 
  Terminal, 
  ArrowLeft, 
  Trash2, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Keyboard
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WorkspaceProps {
  language: SupportedLanguage;
  onBack: () => void;
}

const monacoLanguageMap: Record<SupportedLanguage, string> = {
  python: "python",
  c: "c",
  cpp: "cpp",
  java: "java",
  sql: "sql",
};

export default function Workspace({ language, onBack }: WorkspaceProps) {
  const config = languageConfig[language];
  const [code, setCode] = useState(config.defaultCode);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"output" | "input">("output");
  const editorRef = useRef<any>(null);
  const { toast } = useToast();

  const executeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/execute", {
        code,
        language,
        input: input || undefined,
      });
      return await response.json() as ExecutionResult;
    },
    onSuccess: (result) => {
      setOutput(result.output);
      setError(result.error);
      setExecutionTime(result.executionTime);
      setActiveTab("output");
      if (result.exitCode === 0) {
        toast({
          title: "Execution completed",
          description: `Code ran successfully in ${result.executionTime}ms`,
        });
      } else {
        toast({
          title: "Execution failed",
          description: "Check the output for errors",
          variant: "destructive",
        });
      }
    },
    onError: (err: any) => {
      const message = err?.message || "Failed to execute code";
      setError(message);
      setOutput("");
      setActiveTab("output");
      toast({
        title: "Execution error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleRun = useCallback(() => {
    setOutput("");
    setError("");
    setExecutionTime(null);
    executeMutation.mutate();
  }, [executeMutation]);

  const handleClearOutput = () => {
    setOutput("");
    setError("");
    setExecutionTime(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        toast({
          title: "Code saved",
          description: "Your code has been saved locally",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRun, toast]);

  const isRunning = executeMutation.isPending;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="h-16 border-b border-border flex items-center justify-between px-4 gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Terminal className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-sm font-bold tracking-tight">MAD IDE</h1>
            <p className="text-xs text-muted-foreground">ARCHITECT: MADHAN</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <FileCode className="h-3 w-3" />
            {config.name}
          </Badge>
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Keyboard className="h-3 w-3" />
            Ctrl+Enter to run
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRun}
            disabled={isRunning}
            className="gap-2"
            data-testid="button-run"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Code
              </>
            )}
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 lg:w-[65%] flex flex-col min-h-0">
          <div className="h-10 border-b border-border flex items-center px-4 gap-2 bg-card shrink-0">
            <FileCode className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">main{config.extension}</span>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={monacoLanguageMap[language]}
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbers: "on",
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 4,
                renderLineHighlight: "line",
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        <div className="h-[40%] lg:h-full lg:w-[35%] border-t lg:border-t-0 lg:border-l border-border flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "output" | "input")} className="flex flex-col h-full">
            <div className="h-10 border-b border-border flex items-center justify-between px-4 bg-card shrink-0">
              <TabsList className="h-7">
                <TabsTrigger value="output" className="text-xs gap-1" data-testid="tab-output">
                  <Terminal className="h-3 w-3" />
                  Output
                </TabsTrigger>
                <TabsTrigger value="input" className="text-xs gap-1" data-testid="tab-input">
                  Input
                </TabsTrigger>
              </TabsList>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleClearOutput}
                className="h-7 w-7"
                data-testid="button-clear-output"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            <TabsContent value="output" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 font-mono text-sm">
                  {isRunning ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Executing code...</span>
                    </div>
                  ) : output || error ? (
                    <div className="space-y-4">
                      {executionTime !== null && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pb-2 border-b border-border">
                          {error ? (
                            <AlertCircle className="h-3 w-3 text-destructive" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          )}
                          <span>Execution time: {executionTime}ms</span>
                        </div>
                      )}
                      {output && (
                        <pre className="whitespace-pre-wrap break-words text-foreground" data-testid="text-output">
                          {output}
                        </pre>
                      )}
                      {error && (
                        <pre className="whitespace-pre-wrap break-words text-destructive" data-testid="text-error">
                          {error}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Terminal className="h-4 w-4" />
                      <span>Run your code to see output here</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="input" className="flex-1 m-0 p-4 overflow-hidden">
              <Textarea
                placeholder="Enter input for your program (stdin)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="h-full resize-none font-mono text-sm"
                data-testid="input-stdin"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <footer className="h-8 border-t border-border flex items-center justify-between px-4 bg-card text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-4">
          <span>MAD IDE v1.0</span>
          <span>|</span>
          <span>{config.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>|</span>
          <span>Lines: {code.split("\n").length}</span>
        </div>
      </footer>
    </div>
  );
}
