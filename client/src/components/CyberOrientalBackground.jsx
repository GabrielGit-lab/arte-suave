import React, { useEffect, useRef } from 'react';

/**
 * High-performance offscreen sprite creator for glowing orbs.
 * Pre-renders radial gradients once so the main canvas render loop
 * does not create gradients or calculate heavy canvas shadows every frame.
 */
function createGlowSprite(coreColor, edgeColor) {
  if (typeof document === 'undefined') return null;
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0, coreColor);
  grad.addColorStop(0.35, edgeColor);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

export default function CyberOrientalBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Pre-rendered cached sprites (GPU accelerated drawImage)
    const goldSprite = createGlowSprite('rgba(254, 240, 138, 1)', 'rgba(245, 158, 11, 0.6)');
    const crimsonSprite = createGlowSprite('rgba(254, 202, 202, 1)', 'rgba(239, 68, 68, 0.6)');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let isPaused = false;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
      } else {
        isPaused = false;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Responsive particle count: lighter on mobile to preserve 60fps & battery
    const particleCount = width < 768 ? 22 : 38;

    const particles = Array.from({ length: particleCount }, (_, i) => {
      const isOrb = i % 3 === 0;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        baseSize: isOrb ? Math.random() * 5 + 6 : Math.random() * 2 + 1.2,
        isOrb,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: isOrb ? -Math.random() * 0.35 - 0.15 : -Math.random() * 0.6 - 0.2,
        opacity: isOrb ? Math.random() * 0.45 + 0.35 : Math.random() * 0.6 + 0.3,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.015,
        swayOffset: Math.random() * Math.PI * 2,
        isGold: Math.random() > 0.35
      };
    });

    const render = () => {
      if (isPaused) return;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulse += p.pulseSpeed;
        p.swayOffset += 0.018;

        // Gentle floating movement with sway
        p.x += p.speedX + Math.sin(p.swayOffset) * 0.25;
        p.y += p.speedY;

        // Wrap around boundaries
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        const currentOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));

        if (p.isOrb && goldSprite && crimsonSprite) {
          // Blazing fast sprite drawImage (hardware accelerated, zero garbage collection)
          ctx.globalAlpha = currentOpacity;
          const sprite = p.isGold ? goldSprite : crimsonSprite;
          const renderRadius = p.baseSize * (0.88 + 0.12 * Math.sin(p.pulse));
          const diameter = renderRadius * 2;
          ctx.drawImage(sprite, p.x - renderRadius, p.y - renderRadius, diameter, diameter);
        } else {
          // Fast vector dot for smaller embers
          ctx.globalAlpha = currentOpacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.baseSize, 0, Math.PI * 2);
          ctx.fillStyle = p.isGold ? '#f59e0b' : '#ef4444';
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Cyber Matrix Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(245, 158, 11, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(245, 158, 11, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* 2. Top Cyber Scanline Beam */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/70 to-transparent shadow-[0_0_10px_#f59e0b]" />

      {/* 3. Ambient Cyber Lights Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-amber-500/[0.035] rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-red-600/[0.04] rounded-full blur-[120px]" />

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

      {/* 5. Canvas with GPU-accelerated glowing bolinhas and embers */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
