import React from "react";

interface KaviyamBrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark" | "gold" | "original";
  showTagline?: boolean;
  showWordmark?: boolean;
  titleText?: string;
  className?: string;
  onClick?: () => void;
}

export default function KaviyamBrandLogo({
  size = "md",
  variant = "gold",
  showTagline = false,
  showWordmark = true,
  titleText = "KAVIYAM READING",
  className = "",
  onClick,
}: KaviyamBrandLogoProps) {
  // Dimensions scaling
  const dimMap = {
    sm: { box: "w-8 h-8", text: "text-sm sm:text-base font-black tracking-wide", sub: "text-[8px] tracking-widest", iconH: 32 },
    md: { box: "w-10 h-10", text: "text-lg sm:text-xl font-black tracking-wide", sub: "text-[9px] tracking-[0.2em]", iconH: 40 },
    lg: { box: "w-14 h-14", text: "text-xl sm:text-2xl font-black tracking-wider", sub: "text-[11px] tracking-[0.25em]", iconH: 56 },
    xl: { box: "w-24 h-24", text: "text-3xl sm:text-4xl font-black tracking-widest", sub: "text-xs tracking-[0.3em]", iconH: 96 },
  };

  const current = dimMap[size];

  // Palette definitions matching authentic 7th image
  const primaryBrown = variant === "light" ? "#2B1810" : variant === "gold" ? "#F0C15C" : "#D4AF37";
  const quillColor = variant === "gold" ? "#F59E0B" : "#B87333";
  const quillHighlight = variant === "gold" ? "#FDE68A" : "#D49B6A";
  const pageLight = variant === "dark" ? "#1E293B" : "#F3E5D8";
  const pageMedium = variant === "dark" ? "#334155" : "#D8B493";
  const pageDark = variant === "dark" ? "#475569" : "#6B3E2E";
  const textColor = variant === "dark" ? "text-stone-100" : variant === "gold" ? "text-[#f0c15c]" : "text-[#2B1810]";
  const subtextColor = variant === "dark" ? "text-stone-400" : variant === "gold" ? "text-amber-200/80" : "text-[#6B4435]";

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${onClick ? "cursor-pointer group" : ""} ${className}`}
    >
      {/* Authentic Emblem: Letter K + Feather Quill + Open Classic Book */}
      <div className={`${current.box} flex-shrink-0 relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        >
          <g>
            {/* Open Book Base Left Pages */}
            <path
              d="M80 118C62 108 36 109 20 114C19 114.5 18 113.5 18.2 112.5C22 96 48 94 80 102V118Z"
              fill={pageMedium}
            />
            <path
              d="M80 114C63 103 40 104 24 109C23.2 109.3 22.5 108.5 22.8 107.8C28 92 52 90 80 98V114Z"
              fill={pageLight}
            />
            <path
              d="M80 126C60 115 32 116 16 122C14.8 122.5 14 121 14.5 119.8C20 101 50 99 80 109V126Z"
              fill={pageDark}
            />

            {/* Open Book Base Right Pages */}
            <path
              d="M80 118C98 108 124 109 140 114C141 114.5 142 113.5 141.8 112.5C138 96 112 94 80 102V118Z"
              fill={pageMedium}
            />
            <path
              d="M80 114C97 103 120 104 136 109C136.8 109.3 137.5 108.5 137.2 107.8C132 92 108 90 80 98V114Z"
              fill={pageLight}
            />
            <path
              d="M80 126C100 115 128 116 144 122C145.2 122.5 146 121 145.5 119.8C140 101 110 99 80 109V126Z"
              fill={pageDark}
            />

            {/* Book Spine Notch */}
            <path
              d="M74 124C78 129 82 129 86 124C84 120 76 120 74 124Z"
              fill={primaryBrown}
            />

            {/* Main Letter 'K' Stem and Legs */}
            <path
              d="M44 32C42 32 38 31 36 30V36C38 36.5 42 37.5 45 38.5V98C42 99 38 100 36 100.5V106C39 105.5 44 104.5 47 104.5C51 104.5 56 105.5 60 106V100.5C58 100 54 99 52 98V41C55 40 58 39.5 60 39.5V34C56 34.5 48 33 44 32Z"
              fill={primaryBrown}
            />

            <path
              d="M51 68L82 35C83.5 33.5 86 31.5 89 30.5V36C86 37 82 41 78 45.5L59 66L92 106C94.5 109 98 110.5 101 111V116C97 115.5 91 114.5 87 114.5C83 114.5 77 115.5 73 116V111C75 110 77.5 108 76 105.5L51 74V68Z"
              fill={primaryBrown}
            />

            {/* Attached Feather Quill */}
            <path
              d="M76 56C82 44 94 28 116 14C126 7 136 4 138 4C138 4 137 12 131 24C124 38 109 52 94 62C88 66 82 63 76 56Z"
              fill={quillColor}
            />
            <path
              d="M102 32C112 24 122 16 134 10C130 18 122 28 114 36C108 42 100 48 94 54L91 50C95 44 100 38 102 32Z"
              fill={quillHighlight}
            />
            <path
              d="M112 40C118 34 124 28 132 20C128 27 122 34 116 41C111 46 105 51 99 56L96 52C101 48 107 44 112 40Z"
              fill={quillHighlight}
            />
            <path
              d="M78 58C86 46 100 28 138 4C137 6 102 30 84 62L78 58Z"
              fill={primaryBrown}
            />
          </g>
        </svg>
      </div>

      {/* Wordmark and Tagline: KAVIYAM READING */}
      {(showWordmark || showTagline) && (
        <div className="flex flex-col">
          {showWordmark && (
            <span
              className={`font-serif leading-tight ${current.text} ${textColor} drop-shadow-sm`}
              style={{ fontFamily: "'Playfair Display', 'Cinzel', 'Noto Serif Tamil', Georgia, serif" }}
            >
              {titleText}
            </span>
          )}
          {showTagline && (
            <span
              className={`font-sans font-semibold uppercase ${current.sub} ${subtextColor}`}
            >
              Read • Feel • Explore
            </span>
          )}
        </div>
      )}
    </div>
  );
}
