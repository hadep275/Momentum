import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceTextareaProps extends React.ComponentProps<typeof Textarea> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const VoiceTextarea = ({ value, onChange, ...props }: VoiceTextareaProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef("");
  const shouldStopRef = useRef(false);
  const { toast } = useToast();

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Not supported",
        description: "Voice input is not supported in your browser. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    shouldStopRef.current = false;
    baseTextRef.current = value;
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      // With interimResults: false, each event contains only one new final result
      const transcript = event.results[0][0].transcript;
      baseTextRef.current = baseTextRef.current + transcript + " ";
      
      const syntheticEvent = {
        target: { value: baseTextRef.current },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onChange(syntheticEvent);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event);
      setIsListening(false);
      toast({
        title: "Error",
        description: "Voice input error. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      if (!shouldStopRef.current) {
        try {
          recognition.start();
        } catch (error) {
          console.error("Error restarting recognition:", error);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    shouldStopRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="relative">
      <Textarea value={value} onChange={onChange} {...props} className="pr-12" />
      <Button
        type="button"
        size="icon"
        variant={isListening ? "default" : "ghost"}
        className="absolute right-2 bottom-2 h-8 w-8"
        onClick={isListening ? stopListening : startListening}
      >
        {isListening ? (
          <MicOff className="h-4 w-4 animate-pulse" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
