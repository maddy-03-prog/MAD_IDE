import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Code2, Heart, Sparkles } from "lucide-react";

interface AboutDialogProps {
  accentColor?: string;
}

export function AboutDialog({ accentColor = "#3b82f6" }: AboutDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-gray-400 hover:text-white hover:bg-white/10"
          data-testid="button-about"
        >
          <Info className="h-4 w-4" />
          About
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#12121a] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Code2 className="h-6 w-6" style={{ color: accentColor }} />
            MAD IDE
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center">
            <div 
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ 
                background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
                border: `2px solid ${accentColor}60`,
              }}
            >
              <Sparkles className="h-12 w-12" style={{ color: accentColor }} />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">Created by</h3>
            <p 
              className="text-2xl font-bold"
              style={{ color: accentColor }}
            >
              MADHAN
            </p>
          </div>

          <div className="space-y-3 text-gray-400 text-sm">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
              Multi-language code editor supporting Python, C, C++, Java, and SQL
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
              Real-time code execution with output display
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
              AI-powered assistant for coding help
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              Built with <Heart className="h-3 w-3 text-red-500" /> using React & Monaco Editor
            </p>
            <p className="text-xs text-gray-600 mt-1">Version 1.0</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
