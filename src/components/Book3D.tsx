import React, { useCallback, useRef, useState } from "react";

type Book3DSize = "sm" | "md" | "lg" | "fill";
type Book3DTilt = "hover" | "pointer" | "none";

interface Book3DProps {
  coverUrl: string;
  title: string;
  className?: string;
  size?: Book3DSize;
  tilt?: Book3DTilt;
  float?: boolean;
  overlay?: React.ReactNode;
}

const SIZE_CLASS: Record<Book3DSize, string> = {
  sm: "book3d-size-sm",
  md: "book3d-size-md",
  lg: "book3d-size-lg",
  fill: "book3d-size-fill",
};

export default function Book3D({
  coverUrl,
  title,
  className = "",
  size = "fill",
  tilt = "hover",
  float = false,
  overlay,
}: Book3DProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (tilt !== "pointer" || !sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setPointer({ x, y });
    },
    [tilt]
  );

  const handleLeave = useCallback(() => {
    setHovering(false);
    setPointer({ x: 0, y: 0 });
  }, []);

  const pointerStyle =
    tilt === "pointer"
      ? {
          transform: `rotateY(${-22 + pointer.x * 28}deg) rotateX(${8 - pointer.y * 16}deg) translateZ(${hovering ? 18 : 0}px)`,
        }
      : undefined;

  return (
    <div
      ref={sceneRef}
      className={`book3d-scene ${SIZE_CLASS[size]} ${float ? "book3d-float" : ""} ${className}`}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleLeave}
    >
      <div className="book3d-shadow" />
      <div
        className={`book3d-mesh ${tilt === "hover" ? "book3d-tilt-hover" : ""} ${tilt === "none" ? "book3d-tilt-none" : ""}`}
        style={pointerStyle}
      >
        <div className="book3d-spine" />
        <div className="book3d-pages" />
        <div className="book3d-cover">
          <img src={coverUrl} alt={title} />
          <div className="book3d-gloss" />
        </div>
      </div>
      {overlay ? <div className="book3d-overlay">{overlay}</div> : null}
    </div>
  );
}
