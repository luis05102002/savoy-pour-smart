import { useState, useEffect, useCallback } from 'react';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Don't register SW in iframes or preview hosts
    const isInIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();
    const isPreview = window.location.hostname.includes('id-preview--') || window.location.hostname.includes('lovableproject.com');
    
    if (isInIframe || isPreview || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').then((reg) => {
      setSwRegistration(reg);
    }).catch(() => {});
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied' as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const sendLocalNotification = useCallback((title: string, body: string) => {
    if (permission !== 'granted') return;
    
    // If page is visible, skip — the in-app toast is enough
    if (document.visibilityState === 'visible') return;

    if (swRegistration) {
      swRegistration.showNotification(title, {
        body,
        icon: '/placeholder.svg',
        tag: 'savoy-order',
        renotify: true,
        requireInteraction: true,
      } as NotificationOptions);
    } else {
      new Notification(title, { body, icon: '/placeholder.svg', tag: 'savoy-order' });
    }
  }, [permission, swRegistration]);

  return { permission, requestPermission, sendLocalNotification };
};
