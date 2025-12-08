import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const stars: Star[] = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 3000);
      
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.3 + 0.1,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const drawNebula = (time: number) => {
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.3 + Math.sin(time * 0.0001) * 50,
        canvas.height * 0.4 + Math.cos(time * 0.00015) * 30,
        0,
        canvas.width * 0.3,
        canvas.height * 0.4,
        canvas.width * 0.6
      );
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.08)");
      gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.04)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7 + Math.cos(time * 0.00012) * 40,
        canvas.height * 0.6 + Math.sin(time * 0.0001) * 40,
        0,
        canvas.width * 0.7,
        canvas.height * 0.6,
        canvas.width * 0.5
      );
      gradient2.addColorStop(0, "rgba(236, 72, 153, 0.06)");
      gradient2.addColorStop(0.5, "rgba(147, 51, 234, 0.03)");
      gradient2.addColorStop(1, "transparent");
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawShootingStar = (time: number) => {
      if (Math.random() > 0.998) {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height * 0.3;
        const length = Math.random() * 100 + 50;
        const angle = Math.PI / 4 + Math.random() * 0.2;
        
        const gradient = ctx.createLinearGradient(
          startX, startY,
          startX + Math.cos(angle) * length,
          startY + Math.sin(angle) * length
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        gradient.addColorStop(1, "transparent");
        
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.moveTo(startX, startY);
        ctx.lineTo(
          startX + Math.cos(angle) * length,
          startY + Math.sin(angle) * length
        );
        ctx.stroke();
      }
    };

    const animate = (time: number) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawNebula(time);

      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const currentOpacity = star.opacity * (0.5 + twinkle * 0.5);
        const currentSize = star.size * (0.8 + twinkle * 0.2);

        const dx = star.x - mouseRef.current.x;
        const dy = star.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 150;
        
        if (dist < maxDist) {
          const intensity = 1 - dist / maxDist;
          ctx.shadowBlur = 20 * intensity;
          ctx.shadowColor = "rgba(59, 130, 246, 0.8)";
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();

        if (currentSize > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, currentSize * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.2})`;
          ctx.fill();
        }

        star.y += star.speed * 0.1;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      ctx.shadowBlur = 0;
      drawShootingStar(time);

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "linear-gradient(to bottom, #030712, #0f172a, #1e1b4b)" }}
    />
  );
}
