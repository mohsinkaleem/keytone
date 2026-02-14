import { useEffect, useRef } from 'react';

interface DataPoint {
  name: number;
  wpm: number;
  rawWpm?: number;
  isError?: boolean;
  fullDate?: string;
}

interface CanvasAreaChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  showRawWpm?: boolean;
  showErrors?: boolean;
}

export function CanvasAreaChart({ 
  data, 
  width = 600, 
  height = 250,
  showRawWpm = false,
  showErrors = false
}: CanvasAreaChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get actual container size
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    ctx.scale(dpr, dpr);

    const actualWidth = rect.width;
    const actualHeight = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, actualWidth, actualHeight);

    if (data.length === 0) return;

    // Calculate bounds
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = actualWidth - padding.left - padding.right;
    const chartHeight = actualHeight - padding.top - padding.bottom;

    const allWpms = data.map(d => d.wpm);
    if (showRawWpm) {
      data.forEach(d => { if (d.rawWpm) allWpms.push(d.rawWpm); });
    }
    const maxWpm = Math.max(...allWpms, 60);
    const minWpm = Math.max(0, Math.min(...allWpms) - 10);
    const wpmRange = maxWpm - minWpm;

    // Helper functions
    const getX = (index: number) => padding.left + (index / (data.length - 1 || 1)) * chartWidth;
    const getY = (wpm: number) => padding.top + chartHeight - ((wpm - minWpm) / (wpmRange || 1)) * chartHeight;

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    // Horizontal grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw Raw WPM Line if requested
    if (showRawWpm) {
      ctx.strokeStyle = '#4b5563'; // gray-600
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      data.forEach((point, index) => {
        const x = getX(index);
        const y = getY(point.rawWpm || point.wpm);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw area gradient for primary WPM
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(getX(0), padding.top + chartHeight);
    
    data.forEach((point, index) => {
      ctx.lineTo(getX(index), getY(point.wpm));
    });
    
    ctx.lineTo(getX(data.length - 1), padding.top + chartHeight);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = getX(index);
      const y = getY(point.wpm);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points and errors
    data.forEach((point, index) => {
      const x = getX(index);
      const y = getY(point.wpm);
      
      if (showErrors && point.isError) {
        // Draw error marker
        ctx.fillStyle = '#ef4444'; // red-500
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('×', x, y - 8);
        
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#818cf8';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw axes labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels (only every few if too many points)
    const labelStep = Math.max(1, Math.floor(data.length / 10));
    data.forEach((point, index) => {
      if (index % labelStep === 0 || index === data.length - 1) {
        const x = getX(index);
        ctx.fillText(point.name.toString() + 's', x, padding.top + chartHeight + 20);
      }
    });

    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      const wpmValue = Math.round(maxWpm - (wpmRange / gridLines) * i);
      ctx.fillText(wpmValue.toString(), padding.left - 10, y);
    }

    // Axis labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time (seconds)', actualWidth / 2, actualHeight - 5);
    
    ctx.save();
    ctx.translate(15, actualHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('WPM', 0, 0);
    ctx.restore();

  }, [data, width, height, showRawWpm, showErrors]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: `${height}px` }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default CanvasAreaChart;
