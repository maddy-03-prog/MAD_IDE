import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { languageConfig, type SupportedLanguage } from "@shared/schema";
import { Code2, Terminal, Database, Cpu, Braces } from "lucide-react";
import { SiPython, SiCplusplus } from "react-icons/si";

const languageIcons: Record<SupportedLanguage, JSX.Element> = {
  python: <SiPython className="h-10 w-10" />,
  c: <Code2 className="h-10 w-10" />,
  cpp: <SiCplusplus className="h-10 w-10" />,
  java: <Braces className="h-10 w-10" />,
  sql: <Database className="h-10 w-10" />,
};

interface HomeProps {
  onSelectLanguage: (language: SupportedLanguage) => void;
}

export default function Home({ onSelectLanguage }: HomeProps) {
  const languages = Object.entries(languageConfig) as [SupportedLanguage, typeof languageConfig[SupportedLanguage]][];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b border-border flex items-center justify-between px-6 gap-4">
        <div className="flex items-center gap-3">
          <Terminal className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold tracking-tight" data-testid="text-app-title">MAD IDE</h1>
            <p className="text-xs text-muted-foreground">ARCHITECT: MADHAN</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary tracking-widest uppercase mb-2">ARCHITECT: MADHAN</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-hero-title">Next Gen Development</h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Select your language and enter the workspace.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl w-full">
          {languages.map(([key, config]) => (
            <Card
              key={key}
              className="p-6 cursor-pointer hover-elevate active-elevate-2 transition-all duration-200 flex flex-col items-center text-center group"
              onClick={() => onSelectLanguage(key)}
              data-testid={`card-language-${key}`}
            >
              <div className="h-16 w-16 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-200">
                {languageIcons[key]}
              </div>
              <h3 className="text-xl font-semibold mb-2">{config.name}</h3>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </Card>
          ))}
        </div>
      </main>

      <footer className="h-12 border-t border-border flex items-center justify-center px-6">
        <p className="text-xs text-muted-foreground">
          MAD IDE v1.0 - Built with passion
        </p>
      </footer>
    </div>
  );
}
