import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface VoiceAgentMessage {
  id: string;
  type: "user" | "agent";
  text: string;
  timestamp: Date;
}

interface UseVoiceAgentProps {
  onCommand: (command: string) => Promise<string>;
}

export const useVoiceAgent = ({ onCommand }: UseVoiceAgentProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<VoiceAgentMessage[]>([]);
  const recognitionRef = useRef<any>(null);
  const shouldStopRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support
  const isSupported = () => {
    const hasRecognition = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    const hasSynthesis = "speechSynthesis" in window;
    return hasRecognition && hasSynthesis;
  };

  // Add message to history
  const addMessage = useCallback((type: "user" | "agent", text: string) => {
    const message: VoiceAgentMessage = {
      id: crypto.randomUUID(),
      type,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  }, []);

  // Text-to-speech
  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Process voice command
  const processCommand = useCallback(async (commandText: string) => {
    addMessage("user", commandText);
    
    try {
      const response = await onCommand(commandText);
      addMessage("agent", response);
      speak(response);
    } catch (error) {
      const errorMessage = "I encountered an error processing your command. Please try again.";
      addMessage("agent", errorMessage);
      speak(errorMessage);
    }
  }, [onCommand, addMessage, speak]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported()) {
      toast.error("Voice features not supported in this browser");
      return;
    }

    shouldStopRef.current = false;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      if (event.error !== "no-speech" && event.error !== "aborted") {
        toast.error("Voice input error. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, processCommand]);

  // Stop listening
  const stopListening = useCallback(() => {
    shouldStopRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Toggle agent open/closed
  const toggleAgent = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Clear message history
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
    };
  }, [isListening, stopSpeaking]);

  return {
    isListening,
    isSpeaking,
    isOpen,
    messages,
    isSupported: isSupported(),
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleAgent,
    clearMessages,
  };
};
