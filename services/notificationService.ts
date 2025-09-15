/**
 * Notification Service for Real-time Market Alerts
 * Handles browser notifications, toast messages, and alert management
 */

export interface NotificationConfig {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  priceAlerts: boolean;
  volumeAlerts: boolean;
  marketNews: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

class NotificationService {
  private config: NotificationConfig;
  private toastSubscribers: Map<string, (toast: ToastMessage) => void> = new Map();
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    this.config = this.loadConfig();
    this.requestNotificationPermission();
  }

  // Load notification configuration from localStorage
  private loadConfig(): NotificationConfig {
    const saved = localStorage.getItem('notificationConfig');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      sound: true,
      desktop: false,
      priceAlerts: true,
      volumeAlerts: true,
      marketNews: true
    };
  }

  // Save notification configuration
  public saveConfig(config: NotificationConfig) {
    this.config = config;
    localStorage.setItem('notificationConfig', JSON.stringify(config));
  }

  // Get current configuration
  public getConfig(): NotificationConfig {
    return { ...this.config };
  }

  // Request notification permission
  private async requestNotificationPermission() {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  // Check if notifications are supported and permitted
  public canShowNotifications(): boolean {
    return 'Notification' in window && this.notificationPermission === 'granted';
  }

  // Show desktop notification
  public showDesktopNotification(title: string, message: string, icon?: string): Notification | null {
    if (!this.config.enabled || !this.config.desktop || !this.canShowNotifications()) {
      return null;
    }

    const notification = new Notification(title, {
      body: message,
      icon: icon || '/icon-192x192.png',
      tag: 'market-alert',
      requireInteraction: false,
      silent: !this.config.sound
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  // Play notification sound
  private playNotificationSound() {
    if (!this.config.sound) return;

    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  // Show toast notification
  public showToast(toast: Omit<ToastMessage, 'id'>): string {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const fullToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast
    };

    // Notify all toast subscribers
    this.toastSubscribers.forEach(callback => {
      try {
        callback(fullToast);
      } catch (error) {
        console.error('Error showing toast:', error);
      }
    });

    // Play sound if enabled
    this.playNotificationSound();

    return id;
  }

  // Subscribe to toast notifications
  public subscribeToToasts(subscriberId: string, callback: (toast: ToastMessage) => void) {
    this.toastSubscribers.set(subscriberId, callback);
  }

  // Unsubscribe from toast notifications
  public unsubscribeFromToasts(subscriberId: string) {
    this.toastSubscribers.delete(subscriberId);
  }

  // Handle price alert
  public handlePriceAlert(commodity: string, currentPrice: number, targetPrice: number, alertType: 'above' | 'below') {
    if (!this.config.enabled || !this.config.priceAlerts) return;

    const title = `Price Alert: ${commodity}`;
    const message = `${commodity} is now ${alertType} your target price of ₹${targetPrice}. Current price: ₹${currentPrice}`;

    // Show desktop notification
    this.showDesktopNotification(title, message);

    // Show toast
    this.showToast({
      type: 'warning',
      title,
      message,
      actions: [
        {
          label: 'View Details',
          action: () => {
            // Navigate to market dashboard
            window.location.hash = '#market';
          }
        }
      ]
    });
  }

  // Handle volume alert
  public handleVolumeAlert(commodity: string, market: string, volume: number, threshold: number) {
    if (!this.config.enabled || !this.config.volumeAlerts) return;

    const title = `High Volume Alert: ${commodity}`;
    const message = `Unusual trading volume detected in ${market}. Current: ${volume} units (Threshold: ${threshold})`;

    this.showToast({
      type: 'info',
      title,
      message
    });
  }

  // Handle market news alert
  public handleMarketNews(title: string, message: string, importance: 'high' | 'medium' | 'low' = 'medium') {
    if (!this.config.enabled || !this.config.marketNews) return;

    const toastType = importance === 'high' ? 'warning' : 'info';
    
    if (importance === 'high') {
      this.showDesktopNotification(title, message);
    }

    this.showToast({
      type: toastType,
      title,
      message
    });
  }

  // Handle price spike alert
  public handlePriceSpike(commodity: string, market: string, changePercent: number, price: number) {
    if (!this.config.enabled || !this.config.priceAlerts) return;

    const direction = changePercent > 0 ? 'increased' : 'decreased';
    const title = `Price Spike: ${commodity}`;
    const message = `${commodity} price ${direction} by ${Math.abs(changePercent)}% in ${market}. Current: ₹${price}`;

    // High priority for spikes > 5%
    if (Math.abs(changePercent) > 5) {
      this.showDesktopNotification(title, message);
    }

    this.showToast({
      type: changePercent > 0 ? 'success' : 'error',
      title,
      message,
      actions: [
        {
          label: 'Set Alert',
          action: () => {
            // Open alert configuration
            console.log('Opening alert configuration...');
          }
        }
      ]
    });
  }

  // Handle connection status alerts
  public handleConnectionStatus(isConnected: boolean) {
    if (!this.config.enabled) return;

    if (isConnected) {
      this.showToast({
        type: 'success',
        title: 'Connected',
        message: 'Real-time market data connection restored',
        duration: 3000
      });
    } else {
      this.showToast({
        type: 'error',
        title: 'Connection Lost',
        message: 'Unable to receive real-time updates. Retrying...',
        duration: 10000
      });
    }
  }

  // Bulk notification for market open/close
  public handleMarketStatus(isOpen: boolean) {
    if (!this.config.enabled || !this.config.marketNews) return;

    const title = isOpen ? 'Markets Opened' : 'Markets Closed';
    const message = isOpen 
      ? 'Agricultural commodity markets are now open for trading'
      : 'Agricultural commodity markets have closed for the day';

    this.showToast({
      type: 'info',
      title,
      message,
      duration: 3000
    });
  }

  // Clear all notifications
  public clearAllNotifications() {
    // This would be implemented based on your toast system
    console.log('Clearing all notifications...');
  }

  // Test notification system
  public testNotifications() {
    this.showToast({
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working correctly.',
      actions: [
        {
          label: 'Got it',
          action: () => console.log('Test notification acknowledged')
        }
      ]
    });

    if (this.canShowNotifications()) {
      this.showDesktopNotification(
        'Test Desktop Notification',
        'Desktop notifications are working correctly!'
      );
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
export default notificationService;
