import { useEffect, useState } from "react";
import momentumLogo from "@/assets/momentum-logo.png";

export const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background to-gold/10 animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-700">
        <div className="relative">
          {/* Glowing ring animation */}
          <div className="absolute inset-0 animate-pulse">
            <div className="absolute inset-0 rounded-full bg-gold/20 blur-2xl" />
          </div>
          
          {/* Logo */}
          <img
            src={momentumLogo}
            alt="Momentum"
            className="h-32 w-32 object-contain relative z-10 animate-in spin-in-180 duration-1000"
          />
        </div>
        
        {/* App Name */}
        <div className="text-center space-y-2 animate-in slide-in-from-bottom duration-700 delay-300">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gold via-copper to-rose-pink bg-clip-text text-transparent">
            Momentum
          </h1>
          <p className="text-sm text-muted-foreground">
            Your best self, one day at a time
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2 animate-in fade-in duration-500 delay-500">
          <div className="h-2 w-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="h-2 w-2 rounded-full bg-copper animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="h-2 w-2 rounded-full bg-rose-pink animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
};
