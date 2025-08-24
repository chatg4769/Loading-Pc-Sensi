import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Sparkles } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatbot = ({ isOpen, onClose }: AIChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI Sensitivity Expert. I can help you with setting up your sensitivity configurations, optimizing your gameplay, and answering questions about your purchased sensitivity packs. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Owner-controlled responses - these would be managed by the owner dashboard
  const ownerResponses = {
    "sensitivity setup": "To set up your sensitivity, follow these steps:\n1. Download the sensitivity file from your dashboard\n2. Open your game settings\n3. Navigate to sensitivity settings\n4. Import the downloaded configuration\n5. Apply and restart your game for optimal performance.",
    
    "optimization tips": "Here are some pro optimization tips:\n• Adjust your DPI to match the sensitivity settings\n• Ensure your mouse acceleration is disabled\n• Use a consistent framerate (60fps or higher)\n• Practice with the new settings for at least 3-5 games\n• Fine-tune based on your playstyle preferences.",
    
    "android setup": "For Android setup:\n1. Download the sensitivity file to your device\n2. Open your mobile game\n3. Go to Settings > Controls > Sensitivity\n4. Import the downloaded configuration\n5. Test in training mode before ranked matches.",
    
    "pc setup": "For PC setup:\n1. Download the complete optimization package\n2. Run the installer as administrator\n3. Configure your mouse DPI settings\n4. Apply the sensitivity configuration\n5. Restart your game and test the settings.",
    
    "ios setup": "For iOS setup:\n1. Download the sensitivity profile\n2. Open your game settings\n3. Navigate to Controls > Advanced\n4. Import the sensitivity configuration\n5. Calibrate based on your device model.",
    
    "troubleshooting": "Common troubleshooting steps:\n• Ensure you're using the correct sensitivity file for your platform\n• Check that your game is updated to the latest version\n• Restart your device after applying settings\n• If issues persist, try recalibrating in training mode\n• Contact support if problems continue.",
    
    "default": "I can help you with sensitivity setup, optimization tips, platform-specific configurations (Android, PC, iOS), and troubleshooting. Please ask me about any of these topics, and I'll provide detailed guidance based on your purchased sensitivity packs."
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for keywords and return appropriate owner-controlled response
    if (lowerMessage.includes('android') || lowerMessage.includes('mobile')) {
      return ownerResponses["android setup"];
    } else if (lowerMessage.includes('pc') || lowerMessage.includes('computer')) {
      return ownerResponses["pc setup"];
    } else if (lowerMessage.includes('ios') || lowerMessage.includes('iphone')) {
      return ownerResponses["ios setup"];
    } else if (lowerMessage.includes('setup') || lowerMessage.includes('install') || lowerMessage.includes('configure')) {
      return ownerResponses["sensitivity setup"];
    } else if (lowerMessage.includes('optimize') || lowerMessage.includes('tips') || lowerMessage.includes('improve')) {
      return ownerResponses["optimization tips"];
    } else if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('help') || lowerMessage.includes('trouble')) {
      return ownerResponses["troubleshooting"];
    } else {
      return ownerResponses["default"];
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = getAIResponse(inputMessage);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-tier-legendary flex items-center font-orbitron">
            <Bot className="w-6 h-6 mr-2" />
            AI Sensitivity Expert
            <Badge className="ml-2 bg-tier-legendary text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Legendary Access
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[60vh]">
          {/* Messages Area */}
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === 'ai' && (
                        <Bot className="w-4 h-4 mt-0.5 text-tier-legendary" />
                      )}
                      {message.sender === 'user' && (
                        <User className="w-4 h-4 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="whitespace-pre-line text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg p-3 max-w-[70%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-tier-legendary" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-tier-legendary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-tier-legendary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-tier-legendary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about sensitivity setup, optimization tips..."
                className="bg-input border-border"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="btn-tier-legendary"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This AI assistant is controlled by the store owner and provides responses about sensitivity configuration only.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};