import React, { useEffect, useRef } from 'react';

/**
 * CyberOrientalBackground
 * Blends Japanese martial aesthetic (Kanji, Torii, Sakura embers)
 * with futuristic cyber telemetry (Grid matrix, neon circuits, floating dust).
 */
export default function CyberOrientalBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Subtle floating glowing embers (gold & crimson cyber sparks)
    const sparks = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.6 - 0.2, // Drift gently upwards
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? 'rgba(245, 158, 11,' : 'rgba(239, 68, 68,' // gold or crimson
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render drifting embers
      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        s.x += s.speedX;
        s.y += s.speedY;
        s.pulse += 0.03;

        // Reset if drifted off screen
        if (s.y < -10) {
          s.y = height + 10;
          s.x = Math.random() * width;
        }
        if (s.x < -10) s.x = width + 10;
        if (s.x > width + 10) s.x = -10;

        const currentOpacity = s.opacity * (0.6 + 0.4 * Math.sin(s.pulse));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color} ${currentOpacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color === 'rgba(245, 158, 11,' ? '#f59e0b' : '#ef4444';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Cyber Matrix Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(245, 158, 11, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(245, 158, 11, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* 2. Top Cyber Scanline Beam */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/80 to-transparent shadow-[0_0_12px_#f59e0b]" />

      {/* 3. Ambient Cyber Lights Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-500/[0.04] rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-red-600/[0.05] rounded-full blur-[140px]" />

      {/* 4. Giant Oriental Kanji Watermarks in background */}
      <div className="absolute top-28 right-8 text-[120px] sm:text-[180px] font-black font-serif text-amber-500/[0.025] leading-none select-none pointer-events-none transform rotate-3">
        柔術
      </div>
      <div className="absolute bottom-16 left-6 text-[100px] sm:text-[160px] font-black font-serif text-red-500/[0.025] leading-none select-none pointer-events-none transform -rotate-3">
        武士
      </div>
      <div className="hidden lg:block absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 text-[260px] font-black font-serif text-amber-400/[0.015] leading-none select-none pointer-events-none">
        押忍
      </div>

      {/* 5. Canvas with luminous floating digital sparks */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
