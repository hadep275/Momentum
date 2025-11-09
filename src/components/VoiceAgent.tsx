import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Volume2, VolumeX, X, Trash2 } from "lucide-react";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { parseCommand } from "@/lib/commandParser";
import { executeVoiceAction } from "@/lib/voiceActions";
import { Task, Habit } from "@/types/task";
import { ToDo } from "@/types/todo";
import { cn } from "@/lib/utils";
import momentumLogo from "@/assets/momentum-logo.png";

interface VoiceAgentProps {
  tasks: Task[];
  habits: Habit[];
  todos: ToDo[];
  setTasks: (tasks: Task[]) => void;
  setHabits: (habits: Habit[]) => void;
  setTodos: (todos: ToDo[]) => void;
  onNavigate?: (tab: string) => void;
}

export const VoiceAgent = ({
  tasks,
  habits,
  todos,
  setTasks,
  setHabits,
  setTodos,
  onNavigate,
}: VoiceAgentProps) => {
  // Handle command processing
  const handleCommand = useCallback(
    async (commandText: string): Promise<string> => {
      const parsedCommand = parseCommand(commandText);
      const response = executeVoiceAction(parsedCommand, {
        tasks,
        habits,
        todos,
        setTasks,
        setHabits,
        setTodos,
        onNavigate,
      });
      return response;
    },
    [tasks, habits, todos, setTasks, setHabits, setTodos, onNavigate]
  );

  const {
    isListening,
    isSpeaking,
    isOpen,
    messages,
    isSupported,
    startListening,
    stopListening,
    stopSpeaking,
    toggleAgent,
    clearMessages,
  } = useVoiceAgent({ onCommand: handleCommand });

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Floating Agent Button */}
      <Button
        onClick={toggleAgent}
        size="icon"
        className={cn(
          "fixed bottom-20 right-4 h-16 w-16 rounded-full shadow-lg z-50 transition-all bg-transparent hover:bg-transparent",
          isListening && "animate-pulse bg-accent scale-110",
          isSpeaking && "animate-bounce bg-secondary"
        )}
      >
        <img
          src={momentumLogo}
          alt="Voice Agent"
          className={cn(
            "h-12 w-12 object-contain transition-transform",
            (isListening || isSpeaking) && "scale-110"
          )}
        />
      </Button>

      {/* Agent Dialog */}
      {isOpen && (
        <Card className="fixed bottom-40 right-4 w-96 max-w-[calc(100vw-2rem)] h-[500px] z-50 flex flex-col shadow-2xl border-2 border-gold">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <img
                src={momentumLogo}
                alt="Panda Assistant"
                className={cn(
                  "h-10 w-10 object-contain transition-transform",
                  (isListening || isSpeaking) && "scale-110"
                )}
              />
              <div>
                <h3 className="font-semibold text-foreground">Voice Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Ready to help"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={clearMessages} title="Clear history">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleAgent}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p className="mb-2">Hi! I'm your Momentum assistant.</p>
                  <p className="text-sm">Click the mic to start talking!</p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.type === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.type === "agent" && (
                    <img
                      src={momentumLogo}
                      alt="Agent"
                      className="h-8 w-8 object-contain flex-shrink-0"
                    />
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[80%]",
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.type === "user" && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-primary-foreground font-bold">You</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Controls */}
          <div className="p-4 border-t border-border flex items-center justify-center gap-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className="flex-1"
            >
              {isListening ? (
                <>
                  <MicOff className="h-5 w-5 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Start Listening
                </>
              )}
            </Button>
            {isSpeaking && (
              <Button onClick={stopSpeaking} size="lg" variant="outline">
                <VolumeX className="h-5 w-5" />
              </Button>
            )}
            {!isSpeaking && messages.length > 0 && (
              <div className="h-10 w-10 flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
};
