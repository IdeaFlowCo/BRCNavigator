import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.ideaflow.brcnavigator',
  appName: 'BRC Navigator',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // OPTION A: fully offline (recommended for App Store)
    // No server.url — the app uses the files in webDir.

    // OPTION B: hosted mode (loads your live site)
    // url: 'https://brcnavigator.ideaflow.app',
    // cleartext: false,              // https only
    // androidScheme: 'https'
  },
  android: {
    buildOptions: {
      // Customize Android build settings if needed
    }
  },
  ios: {
    // iOS specific settings
    contentInset: 'automatic'
  }
};

export default config;
