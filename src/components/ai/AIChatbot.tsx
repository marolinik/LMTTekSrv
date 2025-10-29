import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send } from 'lucide-react';
import { chatWithAI } from '@/services/geminiService';
import { ChatMessage } from '@/types/ai.types';
import { useConfiguration } from '@/contexts/ConfigurationContext';
import { configurationToServerSpecs } from '@/utils/configConverter';
import { Loader } from './Loader';

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentConfig } = useConfiguration();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const specs = currentConfig ? configurationToServerSpecs(currentConfig) : [];
      const response = await chatWithAI(messages, input, specs);
      const aiMessage: ChatMessage = { role: 'model', content: response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        role: 'model',
        content: `Error: ${error.message || 'Failed to get response'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-accent hover:bg-accent/90 text-white"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Sidebar */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 animate-in slide-in-from-right">
          <Card className="h-full flex flex-col bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border bg-card">
              <CardTitle className="text-lg text-foreground">
                <span className="text-accent">AI</span> Sales Assistant
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-foreground hover:text-accent">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden bg-card">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-12">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-accent" />
                    <p className="text-sm">Ask me anything about <span className="text-accent">LM TEK</span> servers!</p>
                    <p className="text-xs mt-2">I can help with product info, sales strategies, and more.</p>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-accent text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader text="" variant="dots" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="bg-background border-border text-foreground"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {currentConfig && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Using current configuration: <span className="text-accent">{currentConfig.gpu.quantity}x {currentConfig.gpu.model}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
