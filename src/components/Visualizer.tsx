import { useRef, useEffect, memo } from 'react';

interface VisualizerProps {
  activeNoteCount: number;
  activeFrequencies: Set<number>;
}

export const Visualizer = memo(function Visualizer({
  activeNoteCount,
  activeFrequencies,
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    alpha: number;
    decay: number;
  }

  // Color palette for visualization
  const colors = [
    'rgba(99, 102, 241, ',   // Indigo
    'rgba(168, 85, 247, ',   // Purple
    'rgba(236, 72, 153, ',   // Pink
    'rgba(59, 130, 246, ',   // Blue
    'rgba(20, 184, 166, ',   // Teal
  ];

  // Spawn particles when notes are played
  useEffect(() => {
    if (activeNoteCount > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const frequencies = Array.from(activeFrequencies);
      
      for (let i = 0; i < activeNoteCount * 3; i++) {
        const freq = frequencies[i % frequencies.length] || 440;
        const normalizedFreq = Math.min(1, (freq - 200) / 800);
        
        particlesRef.current.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 200,
          y: canvas.height / 2 + (Math.random() - 0.5) * 100,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 2,
          radius: 3 + Math.random() * 8,
          color: colors[Math.floor(normalizedFreq * colors.length) % colors.length],
          alpha: 0.8,
          decay: 0.01 + Math.random() * 0.02,
        });
      }
    }
  }, [activeNoteCount, activeFrequencies]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = `${p.color}0.5)`;

        return true;
      });

      ctx.shadowBlur = 0;

      // Draw center glow based on active notes
      if (activeNoteCount > 0) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          100 + activeNoteCount * 30
        );
        gradient.addColorStop(0, `rgba(99, 102, 241, ${0.3 * Math.min(activeNoteCount, 3) / 3})`);
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeNoteCount]);

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-48 rounded-2xl bg-gray-900/50 backdrop-blur-sm"
    />
  );
});

export default Visualizer;
