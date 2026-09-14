import React from "react";

interface Book3DProps {
  coverUrl: string;
  title: string;
  author?: string;
  size?: "sm" | "md" | "lg";
  tilt?: "none" | "hover" | "pointer";
  overlay?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Book3D({
  coverUrl,
  title,
  author,
  size = "md",
  tilt = "hover",
  overlay,
  className = "",
  onClick,
}: Book3DProps) {
  const sizeClasses = {
    sm: "w-28 h-40 sm:w-32 sm:h-44",
    md: "w-40 h-56 sm:w-48 sm:h-68",
    lg: "w-52 h-72 sm:w-64 sm:h-88",
  };

  const isHoverTilt = tilt === "hover" || tilt === "pointer";

  return (
    <div
      onClick={onClick}
      className={`relative group perspective-1000 select-none ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <div
        className={`relative ${sizeClasses[size]} rounded-r-lg shadow-xl transition-all duration-500 ease-out transform-style-3d ${
          isHoverTilt
            ? "group-hover:-rotate-y-12 group-hover:rotate-x-6 group-hover:scale-105 group-hover:shadow-2xl"
            : ""
        }`}
      >
        {/* Book Spine (3D depth edge on left) */}
        <div className="absolute top-0 bottom-0 left-0 w-4 sm:w-5 bg-stone-900 border-r border-amber-900/40 transform -translate-x-full rotate-y-90 origin-right flex flex-col items-center justify-between py-2 text-[9px] text-amber-200/80 font-serif tracking-widest uppercase overflow-hidden">
          <span className="writing-vertical rotate-180 truncate max-h-24">
            {title}
          </span>
          <div className="w-2 h-2 rounded-full border border-amber-400/50" />
        </div>

        {/* Book Pages Thickness (Right edge) */}
        <div className="absolute top-1 bottom-1 right-0 w-3 bg-gradient-to-r from-stone-200 via-stone-100 to-amber-50 transform translate-x-full rotate-y-90 origin-left border-l border-stone-300 shadow-inner">
          <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(0deg,#000_0px,#000_1px,transparent_1px,transparent_3px)]" />
        </div>

        {/* Book Cover Image Container */}
        <div className="relative w-full h-full rounded-r-lg overflow-hidden border border-stone-800/20 bg-stone-900">
          <img
            src={coverUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400"}
            alt={title}
            className="w-full h-full object-cover rounded-r-lg"
            loading="lazy"
            onError={(e) => {
              // Fallback image if cover fails to load
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400";
            }}
          />

          {/* Book Texture Overlay / Realistic Gloss & Shadow */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/10 pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />

          {/* Minimal Cover Title Overlay if no author badge */}
          {title && (
            <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
              <p className="font-serif font-bold text-xs sm:text-sm line-clamp-2 leading-tight drop-shadow-md">
                {title}
              </p>
              {author && (
                <p className="text-[10px] text-stone-300 font-sans line-clamp-1 mt-0.5 opacity-90">
                  {author}
                </p>
              )}
            </div>
          )}

          {/* Optional Overlay element (e.g. Star rating badge) */}
          {overlay}
        </div>
      </div>
    </div>
  );
}
