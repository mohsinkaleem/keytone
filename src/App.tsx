import { useState } from 'react';
import { audioEngine, type SoundTheme } from './audio';
import { StartOverlay, TypingPractice } from './components';

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [soundTheme, setSoundTheme] = useState<SoundTheme>('piano');
  const [volume, setVolume] = useState(0.5);

  // Handle audio initialization
  const handleStart = async () => {
    await audioEngine.initialize();
    audioEngine.setSoundTheme(soundTheme);
    setIsStarted(true);
  };

  // Handle sound theme change
  const handleSoundThemeChange = (newTheme: SoundTheme) => {
    setSoundTheme(newTheme);
    audioEngine.setSoundTheme(newTheme);
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    audioEngine.setVolume(newVolume);
  };

  // Show start overlay if not started
  if (!isStarted) {
    return <StartOverlay onStart={handleStart} />;
  }

  // Main typing practice view
  return (
    <div className="min-h-screen flex flex-col">
      <TypingPractice
        soundTheme={soundTheme}
        onSoundThemeChange={handleSoundThemeChange}
        volume={volume}
        onVolumeChange={handleVolumeChange}
      />
    </div>
  );
}

export default App;
