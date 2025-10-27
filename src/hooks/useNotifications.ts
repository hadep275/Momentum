import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted' || !isSupported) {
      return;
    }

    try {
      new Notification(title, {
        icon: '/logo-option-2.png',
        badge: '/logo-option-2.png',
        ...options,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
  };
};
