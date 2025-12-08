import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { SpaceBackground } from "@/components/space-background";
import { languageConfig, type SupportedLanguage } from "@shared/schema";
import { Code2, Terminal, Database, Braces } from "lucide-react";
import { SiPython, SiCplusplus } from "react-icons/si";

const languageIcons: Record<SupportedLanguage, JSX.Element> = {
  python: <SiPython className="h-12 w-12" />,
  c: <Code2 className="h-12 w-12" />,
  cpp: <SiCplusplus className="h-12 w-12" />,
  java: <Braces className="h-12 w-12" />,
  sql: <Database className="h-12 w-12" />,
};

const languageColors: Record<SupportedLanguage, { glow: string; border: string; gradient: string }> = {
  python: {
    glow: "rgba(59, 130, 246, 0.6)",
    border: "border-blue-500/50",
    gradient: "from-blue-500/20 to-blue-600/10",
  },
  c: {
    glow: "rgba(99, 102, 241, 0.6)",
    border: "border-indigo-500/50",
    gradient: "from-indigo-500/20 to-indigo-600/10",
  },
  cpp: {
    glow: "rgba(139, 92, 246, 0.6)",
    border: "border-violet-500/50",
    gradient: "from-violet-500/20 to-violet-600/10",
  },
  java: {
    glow: "rgba(249, 115, 22, 0.6)",
    border: "border-orange-500/50",
    gradient: "from-orange-500/20 to-orange-600/10",
  },
  sql: {
    glow: "rgba(34, 197, 94, 0.6)",
    border: "border-green-500/50",
    gradient: "from-green-500/20 to-green-600/10",
  },
};

interface HomeProps {
  onSelectLanguage: (language: SupportedLanguage) => void;
}

export default function Home({ onSelectLanguage }: HomeProps) {
  const [hoveredLang, setHoveredLang] = useState<SupportedLanguage | null>(null);
  const languages = Object.entries(languageConfig) as [SupportedLanguage, typeof languageConfig[SupportedLanguage]][];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SpaceBackground />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="h-16 backdrop-blur-md bg-black/30 border-b border-white/10 flex items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Terminal className="h-7 w-7 text-blue-400" />
              <div className="absolute inset-0 blur-md bg-blue-500/50 -z-10" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white" data-testid="text-app-title">
              MAD IDE
            </h1>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-16">
            <h2 
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent"
              data-testid="text-hero-title"
            >
              Next Gen Development
            </h2>
            
            <p className="text-lg text-gray-400 max-w-lg mx-auto">
              Select your language and enter the workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl w-full px-4">
            {languages.map(([key, config]) => {
              const colors = languageColors[key];
              const isHovered = hoveredLang === key;
              
              return (
                <div
                  key={key}
                  className="relative group"
                  onMouseEnter={() => setHoveredLang(key)}
                  onMouseLeave={() => setHoveredLang(null)}
                >
                  {isHovered && (
                    <div
                      className="absolute -inset-2 rounded-2xl blur-xl transition-opacity duration-500 opacity-100"
                      style={{ background: colors.glow }}
                    />
                  )}
                  
                  <Card
                    className={`
                      relative p-8 cursor-pointer transition-all duration-300 ease-out
                      bg-gradient-to-br ${colors.gradient}
                      backdrop-blur-sm border-2 ${isHovered ? colors.border : "border-white/10"}
                      hover:scale-105 hover:-translate-y-2
                      flex flex-col items-center text-center
                      overflow-visible
                    `}
                    onClick={() => onSelectLanguage(key)}
                    data-testid={`card-language-${key}`}
                  >
                    <div 
                      className={`
                        h-20 w-20 flex items-center justify-center rounded-full mb-4
                        transition-all duration-300
                        ${isHovered ? "scale-110" : "scale-100"}
                      `}
                      style={{
                        background: isHovered 
                          ? `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`
                          : "transparent",
                        boxShadow: isHovered ? `0 0 40px ${colors.glow}` : "none",
                      }}
                    >
                      <div className={`text-white transition-all duration-300 ${isHovered ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" : ""}`}>
                        {languageIcons[key]}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 transition-all duration-300">
                      {config.name}
                    </h3>
                    
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      {config.description}
                    </p>

                    {isHovered && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                        <div 
                          className="h-1 w-16 rounded-full blur-sm"
                          style={{ background: colors.glow }}
                        />
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </main>

        <footer className="h-14 backdrop-blur-md bg-black/30 border-t border-white/10 flex items-center justify-center px-6">
          <p className="text-sm text-gray-500">
            <span className="font-bold">MAD IDE</span> v1.0 - Built with passion
          </p>
        </footer>
      </div>
    </div>
  );
}
