import React from "react";
import { BookOpen } from "lucide-react";

interface KaviyamBrandLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}

export default function KaviyamBrandLogo({
  size = "md",
  showWordmark = true,
  className = "",
}: KaviyamBrandLogoProps) {
  const sizeMap = {
    sm: "w-7 h-7 text-xs",
    md: "w-8.5 h-8.5 text-sm",
    lg: "w-11 h-11 text-base",
  };

  const iconSizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Emblem Icon with Maroon / Gold gradients */}
      <div
        className={`${sizeMap[size].split(" ")[0]} ${sizeMap[size].split(" ")[1]} rounded-xl bg-gradient-to-br from-[#3B0B12] via-[#5C121E] to-[#24060B] border border-amber-400/40 shadow-sm flex items-center justify-center text-amber-300 transform transition-transform group-hover:scale-105 shrink-0`}
      >
        <BookOpen className={`${iconSizeMap[size]} text-amber-300 drop-shadow-xs`} />
      </div>

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-serif font-black text-sm tracking-tight text-[#3B0B12]">
            Kaviyam<span className="text-[#D4AF37] font-semibold">-Reading</span>
          </span>
          <span className="text-[9px] font-sans font-semibold text-stone-500 uppercase tracking-widest mt-0.5">
            காவியம் வாசிப்பு
          </span>
        </div>
      )}
    </div>
  );
}
