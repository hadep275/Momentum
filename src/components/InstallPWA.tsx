import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X, Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { permission, isSupported, requestPermission } = useNotifications();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      
      // Request notification permission after install
      if (isSupported && permission === 'default') {
        setTimeout(() => {
          requestPermission();
        }, 1000);
      }
    }
  };

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  if (isInstalled || (!showInstallPrompt && permission === 'granted')) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in md:left-auto md:right-4 md:w-96">
      {showInstallPrompt && (
        <Card className="p-4 border-2 border-gold/30 bg-card/95 backdrop-blur-sm shadow-xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => setShowInstallPrompt(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <Download className="h-5 w-5 text-gold" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Install Momentum</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Add to your home screen for the best experience and notifications!
              </p>
              <Button 
                onClick={handleInstallClick}
                className="w-full bg-gold hover:bg-gold/90 text-black"
                size="sm"
              >
                Install App
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!showInstallPrompt && isSupported && permission === 'default' && (
        <Card className="p-4 border-2 border-gold/30 bg-card/95 backdrop-blur-sm shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <Bell className="h-5 w-5 text-gold" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Enable Notifications</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Get reminders for your tasks and habits
              </p>
              <Button 
                onClick={handleEnableNotifications}
                className="w-full bg-gold hover:bg-gold/90 text-black"
                size="sm"
              >
                Enable Notifications
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
