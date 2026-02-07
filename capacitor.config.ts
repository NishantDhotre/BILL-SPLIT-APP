import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.billsplitter.app',
  appName: 'BillSplitterPro',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'LIGHT', // Dark text for light background
      backgroundColor: '#f8fafc',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
