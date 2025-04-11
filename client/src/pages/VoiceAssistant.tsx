import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Mic, MicOff, Send, Loader2, VolumeX, Volume2 } from 'lucide-react';

// Types for conversation
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function VoiceAssistant() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Hello! I\'m your plant care voice assistant. You can ask me any questions about plant care, or about your specific plants. How can I help you today?',
    timestamp: new Date()
  }]);
  
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isSpeechSynthesisSupported, setIsSpeechSynthesisSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  
  // Check if speech recognition is supported
  useEffect(() => {
    // Check for SpeechRecognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      
      // Initialize speech recognition
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setTextInput(transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast({
          title: 'Speech Recognition Error',
          description: `Error: ${event.error}. Please try again.`,
          variant: 'destructive'
        });
      };
    }
    
    // Check for speech synthesis support
    if (window.speechSynthesis) {
      setIsSpeechSynthesisSupported(true);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [toast]);
  
  // Scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const toggleListening = () => {
    if (!isSpeechSupported) {
      toast({
        title: 'Speech Recognition Not Supported',
        description: 'Your browser does not support speech recognition. Please use the text input instead.',
        variant: 'destructive'
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setTextInput('');
    }
  };
  
  const speakResponse = (text: string) => {
    if (!isSpeechSynthesisSupported) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find a female voice that sounds natural
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Google UK English Female'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };
  
  const toggleSpeaking = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Find the last assistant message and speak it
      const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
      if (lastAssistantMessage) {
        speakResponse(lastAssistantMessage.content);
      }
    }
  };
  
  const sendMessage = async () => {
    if (!textInput.trim()) return;
    
    // Stop listening if we're currently listening
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    const userMessage: Message = {
      role: 'user',
      content: textInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);
    setTextInput('');
    
    try {
      const response = await apiRequest({
        url: '/api/voice-assistant',
        method: 'POST',
        data: { query: userMessage.content }
      });
      
      const data = await response.json();
      
      if (response.ok && data.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Auto-speak the response if supported
        if (isSpeechSynthesisSupported) {
          speakResponse(data.response);
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to get a response',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to communicate with the voice assistant',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSending) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="flex flex-col p-4 md:p-6 h-full">
      <div className="flex flex-col h-full">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Plant Care Voice Assistant</CardTitle>
                <CardDescription>
                  Ask questions about plant care or get help with your plants
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSpeaking}
                disabled={!isSpeechSynthesisSupported}
                className={!isSpeechSynthesisSupported ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-4 pb-0 overflow-auto">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <div 
                    key={idx}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <div className="mb-1">{message.content}</div>
                      <div 
                        className={`text-xs ${
                          message.role === 'user' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="p-4 pt-2">
            <div className="flex items-center w-full gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleListening}
                disabled={!isSpeechSupported}
                className={`${!isSpeechSupported ? 'opacity-50 cursor-not-allowed' : ''} ${
                  isListening ? 'bg-red-100 text-red-500 border-red-200' : ''
                }`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </Button>
              
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={isListening ? 'Listening...' : 'Type your message or use voice input...'}
                disabled={isSending}
                className="flex-1"
              />
              
              <Button 
                onClick={sendMessage} 
                disabled={isSending || !textInput.trim()}
                size="icon"
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}