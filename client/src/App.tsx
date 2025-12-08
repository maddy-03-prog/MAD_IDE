import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Workspace from "@/pages/workspace";
import { type SupportedLanguage } from "@shared/schema";

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {selectedLanguage ? (
          <Workspace
            language={selectedLanguage}
            onBack={() => setSelectedLanguage(null)}
          />
        ) : (
          <Home onSelectLanguage={setSelectedLanguage} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
