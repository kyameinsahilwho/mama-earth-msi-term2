"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, X, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { chatWithMamaAi } from "@/ai/flows/chat-flow";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'model';
  content: string;
  image?: string;
}

export default function MamaAiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi there! I'm MAMA AI 🌿. I'm here to help you with all your skincare and haircare questions. Ask me anything!" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: "destructive", title: "File too large", description: "Please upload an image smaller than 5MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // Convert messages to format expected by backend
      const history = messages.map(m => ({
        role: m.role,
        content: [{ text: m.content }] // Simplified content structure
      }));

      const responseText = await chatWithMamaAi({
        history,
        message: userMessage.content,
        image: userMessage.image
      });

      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to get a response. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all duration-300 ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="h-8 w-8" />
      </Button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10 pointer-events-none'}`}>
        <Card className="w-[350px] md:w-[400px] h-[500px] flex flex-col shadow-2xl border-2 border-primary/20">
          <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">MAMA AI</CardTitle>
                <p className="text-xs text-primary-foreground/80">Skincare Expert</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/20">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden bg-secondary/10">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="h-8 w-8 mt-1 border border-border">
                        {msg.role === 'user' ? (
                          <AvatarFallback>ME</AvatarFallback>
                        ) : (
                          <AvatarImage src="/bot-avatar.png" />
                          // Fallback if no image
                        )}
                        {msg.role === 'model' && <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>}
                      </Avatar>
                      
                      <div className={`rounded-2xl p-3 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-white border border-border rounded-tl-none shadow-sm'
                      }`}>
                        {msg.image && (
                          <img src={msg.image} alt="Uploaded" className="max-w-full rounded-md mb-2 border border-white/20" />
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <Avatar className="h-8 w-8 mt-1 border border-border">
                        <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                      </Avatar>
                      <div className="bg-white border border-border rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 bg-background border-t">
            <div className="flex flex-col w-full gap-2">
              {selectedImage && (
                <div className="relative inline-block w-fit">
                  <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <div className="flex w-full gap-2 items-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Image"
                >
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Input 
                  placeholder="Ask about skincare..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage} 
                  disabled={(!inputValue.trim() && !selectedImage) || isLoading}
                  className="shrink-0"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
