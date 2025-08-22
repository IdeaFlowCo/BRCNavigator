import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

// Check if we're running in a native app
export const isNative = Capacitor.isNativePlatform();

// Open external URLs in the browser
export const openExternalUrl = async (url: string) => {
  if (isNative) {
    await Browser.open({ url });
  } else {
    window.open(url, '_blank');
  }
};

// Provide haptic feedback
export const hapticFeedback = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (isNative) {
    await Haptics.impact({ style });
  }
};

// Initialize status bar for mobile
export const initializeStatusBar = async () => {
  if (isNative) {
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    } catch (error) {
      console.warn('StatusBar plugin not available:', error);
    }
  }
};

// Handle app state changes
export const setupAppListeners = () => {
  if (isNative) {
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive);
    });

    App.addListener('backButton', () => {
      // Handle Android back button
      if (window.history.length > 1) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  }
};

// Clean up listeners
export const removeAppListeners = () => {
  if (isNative) {
    App.removeAllListeners();
  }
};