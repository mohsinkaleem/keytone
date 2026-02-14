import { useState, useCallback } from 'react';
import { audioEngine, type WaveformType } from './audio';
import { StartOverlay, TypingPractice } from './components';

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [waveform, setWaveform] = useState<WaveformType>('sine');
  const [volume, setVolume] = useState(0.5);

  // Handle audio initialization
  const handleStart = useCallback(async () => {
    await audioEngine.initialize();
    setIsStarted(true);
  }, []);

  // Handle waveform change
  const handleWaveformChange = useCallback((newWaveform: WaveformType) => {
    setWaveform(newWaveform);
    audioEngine.setWaveform(newWaveform);
  }, []);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    audioEngine.setVolume(newVolume);
  }, []);

  // Show start overlay if not started
  if (!isStarted) {
    return <StartOverlay onStart={handleStart} />;
  }

  // Main typing practice view
  return (
    <div className="min-h-screen flex flex-col">
      <TypingPractice
        waveform={waveform}
        onWaveformChange={handleWaveformChange}
        volume={volume}
        onVolumeChange={handleVolumeChange}
      />
    </div>
  );
}

export default App;
