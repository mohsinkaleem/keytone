import { memo, useEffect, useRef } from 'react';
import { audioEngine } from '../audio';

interface AudioVisualizerProps {
  isActive?: boolean;
  height?: number;
  className?: string;
  style?: 'bars' | 'wave' | 'circular';
  colorScheme?: 'gradient' | 'mono' | 'rainbow';
}

export const AudioVisualizer = memo(function AudioVisualizer({
  isActive = true,
  height = 60,
  className = '',
  style = 'bars',
  colorScheme = 'gradient',
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const getColor = (value: number, index: number, total: number): string => {
      const normalizedValue = value / 255;
      
      switch (colorScheme) {
        case 'rainbow': {
          const hue = (index / total) * 360;
          return `hsl(${hue}, 80%, ${50 + normalizedValue * 20}%)`;
        }
        case 'mono':
          return `rgba(255, 255, 255, ${0.3 + normalizedValue * 0.7})`;
        case 'gradient':
        default: {
          const r = Math.floor(99 + normalizedValue * 100);
          const g = Math.floor(102 + normalizedValue * 50);
          const b = Math.floor(241 - normalizedValue * 50);
          return `rgba(${r}, ${g}, ${b}, ${0.5 + normalizedValue * 0.5})`;
        }
      }
    };

    const drawBars = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        ctx.fillStyle = getColor(dataArray[i], i, bufferLength);
        
        // Round the bars
        const radius = Math.min(barWidth / 2, barHeight / 2, 4);
        const y = canvas.height - barHeight;
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 2, barHeight, [radius, radius, 0, 0]);
        ctx.fill();

        x += barWidth;
      }
    };

    const drawWave = () => {
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = getColor(180, 0, 1);
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    const drawCircular = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.6;

      for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * Math.PI * 2;
        const amplitude = (dataArray[i] / 255) * radius * 0.5;

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + amplitude);
        const y2 = centerY + Math.sin(angle) * (radius + amplitude);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = getColor(dataArray[i], i, bufferLength);
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    const draw = () => {
      switch (style) {
        case 'wave':
          drawWave();
          break;
        case 'circular':
          drawCircular();
          break;
        case 'bars':
        default:
          drawBars();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    // Handle resize
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, height, style, colorScheme]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full ${className}`}
      style={{ height }}
    />
  );
});

export default AudioVisualizer;
