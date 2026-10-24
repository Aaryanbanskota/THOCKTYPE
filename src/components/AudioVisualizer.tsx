'use client';

import React, { useEffect, useRef } from 'react';
import { useSound } from '@/context/sound-context';
import { SWITCH_PROFILES } from '@/lib/sound-profiles';

interface AudioVisualizerProps {
  className?: string;
  height?: number;
  barColor?: string;
}

export function AudioVisualizer({ className = '', height = 48, barColor }: AudioVisualizerProps) {
  const { analyser, activePack } = useSound();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const profile = SWITCH_PROFILES[activePack];
  const color = barColor || profile?.color || '#38bdf8';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isMounted = true;
    let idleFrames = 0;
    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!isMounted) return;

      if (typeof document !== 'undefined' && document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      let hasSignal = false;
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        for (let j = 0; j < Math.min(bufferLength, 32); j++) {
          if (dataArray[j] > 4) {
            hasSignal = true;
            break;
          }
        }
      } else {
        dataArray.fill(0);
      }

      // If audio is idle for half a second, pause expensive 60-120fps canvas rendering
      if (!hasSignal) {
        idleFrames++;
        if (idleFrames > 25) {
          const width = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, width, h);
          const bars = 24;
          const barWidth = width / bars - 2;
          ctx.fillStyle = `${color}22`;
          for (let i = 0; i < bars; i++) {
            const x = i * (barWidth + 2);
            ctx.beginPath();
            ctx.roundRect(x, h - 3, barWidth, 3, [2, 2, 0, 0]);
            ctx.fill();
          }

          // Throttle idle polling to save battery & CPU
          setTimeout(() => {
            if (isMounted) animId = requestAnimationFrame(render);
          }, 120);
          return;
        }
      } else {
        idleFrames = 0;
      }

      animId = requestAnimationFrame(render);

      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      // Draw symmetrical frequency bars
      const bars = 24;
      const barWidth = (width / bars) - 2;

      for (let i = 0; i < bars; i++) {
        // Sample frequencies centered around keyboard clack range (index 1 to 28)
        const freqIndex = Math.floor((i / bars) * Math.min(bufferLength, 32));
        const value = dataArray[freqIndex] || 0;
        const percent = value / 255;
        const barHeight = Math.max(3, percent * (h - 4));

        const x = i * (barWidth + 2);
        const y = h - barHeight;

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, color);
        grad.addColorStop(1, `${color}33`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }
    };

    render();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
    };
  }, [analyser, color]);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-zinc-950/40 p-1 border border-zinc-800/60 ${className}`}>
      <canvas
        ref={canvasRef}
        width={192}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
}
