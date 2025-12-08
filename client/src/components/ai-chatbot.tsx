import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Bot, 
  User,
  Sparkles
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatbotProps {
  accentColor?: string;
}

export function AIChatbot({ accentColor = "#3b82f6" }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant. I can help you with coding questions, general knowledge, or anything else you'd like to know. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        message: userMessage,
        history: messages.slice(-10),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    chatMutation.mutate(userMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          style={{ 
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
            boxShadow: `0 4px 20px ${accentColor}40`,
          }}
          data-testid="button-open-chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 w-96 h-[500px] bg-[#12121a] border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
          style={{ boxShadow: `0 8px 32px ${accentColor}20` }}
        >
          <div 
            className="h-14 px-4 flex items-center justify-between shrink-0"
            style={{ 
              background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
              borderBottom: `1px solid ${accentColor}30`,
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="h-8 w-8 rounded-full flex items-center justify-center"
                style={{ background: `${accentColor}30` }}
              >
                <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Assistant</h3>
                <p className="text-xs text-gray-400">Ask me anything</p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
              data-testid="button-close-chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div 
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      message.role === "user" 
                        ? "bg-white/10" 
                        : ""
                    }`}
                    style={message.role === "assistant" ? { background: `${accentColor}30` } : {}}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Bot className="h-4 w-4" style={{ color: accentColor }} />
                    )}
                  </div>
                  <div 
                    className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                      message.role === "user"
                        ? "bg-white/10 text-white"
                        : "text-gray-200"
                    }`}
                    style={message.role === "assistant" ? { 
                      background: `${accentColor}15`,
                      border: `1px solid ${accentColor}20`,
                    } : {}}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex gap-3">
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ background: `${accentColor}30` }}
                  >
                    <Bot className="h-4 w-4" style={{ color: accentColor }} />
                  </div>
                  <div 
                    className="px-4 py-2 rounded-xl"
                    style={{ 
                      background: `${accentColor}15`,
                      border: `1px solid ${accentColor}20`,
                    }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: accentColor }} />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-white/10 shrink-0">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[44px] max-h-24 resize-none bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-sm"
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                size="icon"
                className="h-11 w-11 shrink-0"
                style={{ 
                  background: input.trim() ? accentColor : "rgba(255,255,255,0.1)",
                }}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
