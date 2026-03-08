import { Dashboard } from './components/Dashboard';
import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';

function App() {
  useEffect(() => {
    // Set Status Bar style for Android/iOS
    const configureStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#f8fafc' });
      } catch {
        // StatusBar not available (e.g. web mode)
      }
    };
    configureStatusBar();
  }, []);

  return (
    <Dashboard />
  );
}

export default App;
