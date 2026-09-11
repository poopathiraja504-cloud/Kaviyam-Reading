import React, { useState, useRef } from "react";
import { triggerHaptic, playTactileSound, HapticPatternType } from "../utils/haptics";

interface ThreeDTiltCardProps {
  children: React.ReactNode;
  className?: string;
  hapticPattern?: HapticPatternType;
  maxRotation?: number; // degrees
  scaleOnHover?: number;
  onClick?: (e: React.MouseEvent) => void;
  glareEffect?: boolean;
  depth?: number; // translateZ px
  id?: string;
}

export const ThreeDTiltCard: React.FC<ThreeDTiltCardProps> = ({
  children,
  className = "",
  hapticPattern = "light" as HapticPatternType,
  maxRotation = 12,
  scaleOnHover = 1.03,
  onClick,
  glareEffect = true,
  depth = 20,
  id,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [scale, setScale] = useState(1);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const pctX = (mouseX / width) * 100;
    const pctY = (mouseY / height) * 100;

    // Calculate 3D tilt angles
    const rY = ((mouseX - width / 2) / (width / 2)) * maxRotation;
    const rX = -((mouseY - height / 2) / (height / 2)) * maxRotation;

    setRotX(rX);
    setRotY(rY);
    setGlarePos({ x: pctX, y: pctY, opacity: 0.25 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setScale(scaleOnHover);
    triggerHaptic(hapticPattern);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotX(0);
    setRotY(0);
    setScale(1);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    triggerHaptic("3d-pulse");
    playTactileSound(280, 40);
    if (onClick) onClick(e);
  };

  return (
    <div
      ref={cardRef}
      id={id}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out cursor-pointer select-none ${className}`}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
        transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${scale}, ${scale}, ${scale})`,
        boxShadow: isHovered
          ? "0 20px 35px -10px rgba(0, 0, 0, 0.5), 0 0 25px rgba(240, 193, 92, 0.2)"
          : "0 10px 20px -5px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* 3D Depth Layer */}
      <div
        style={{
          transform: `translateZ(${depth}px)`,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full"
      >
        {children}
      </div>

      {/* 3D Glare Reflection */}
      {glareEffect && (
        <div
          className="pointer-events-none absolute inset-0 rounded-inherit transition-opacity duration-300 z-20"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 70%)`,
            opacity: glarePos.opacity,
            mixBlendMode: "overlay",
          }}
        />
      )}
    </div>
  );
};

export default ThreeDTiltCard;
