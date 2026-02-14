import { useState, useEffect, useCallback } from 'react';
import { audioEngine, type SoundTheme } from './audio';
import { TypingPractice } from './components';

function App() {
  const [soundTheme, setSoundTheme] = useState<SoundTheme>('piano');
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  // Initialize audio on first user interaction
  const initAudio = useCallback(async () => {
    if (isAudioInitialized) return;
    
    try {
      await audioEngine.initialize();
      audioEngine.setSoundTheme(soundTheme);
      audioEngine.setVolume(volume);
      audioEngine.setMuted(isMuted);
      setIsAudioInitialized(true);
      
      // Remove the listeners once initialized
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('mousedown', initAudio);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, [isAudioInitialized, soundTheme, volume]);

  useEffect(() => {
    window.addEventListener('keydown', initAudio);
    window.addEventListener('mousedown', initAudio);
    
    return () => {
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('mousedown', initAudio);
    };
  }, [initAudio]);

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

  // Handle mute toggle
  const handleMuteToggle = (muted: boolean) => {
    setIsMuted(muted);
    audioEngine.setMuted(muted);
  };

  // Main typing practice view
  return (
    <div className="min-h-screen flex flex-col">
      <TypingPractice
        soundTheme={soundTheme}
        onSoundThemeChange={handleSoundThemeChange}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onMuteToggle={handleMuteToggle}
      />
    </div>
  );
}

export default App;
