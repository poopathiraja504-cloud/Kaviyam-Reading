import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";

const OTP_LENGTH = 6;

interface LiquidOTPProps {
  value: string;
  onChange: (val: string) => void;
  isDarkMode?: boolean;
}

export default function LiquidOTP({ value, onChange, isDarkMode = false }: LiquidOTPProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Keep internal state in sync with external value prop
  useEffect(() => {
    const arr = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < OTP_LENGTH; i++) {
      arr[i] = value[i] || "";
    }
    setOtp(arr);
    
    // Set active index to first empty box or last box
    const firstEmpty = arr.findIndex((v) => v === "");
    if (firstEmpty !== -1) {
      setActiveIndex(firstEmpty);
    } else {
      setActiveIndex(OTP_LENGTH - 1);
    }
  }, [value]);

  const handleChange = (val: string, index: number) => {
    // Only accept single digits
    if (!/^\d?$/.test(val)) return;
    
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    
    const combined = newOtp.join("");
    onChange(combined);

    // Auto-focus next input
    if (val && index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
        onChange(newOtp.join(""));
      } else {
        newOtp[index] = "";
        setOtp(newOtp);
        onChange(newOtp.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, OTP_LENGTH).split("");
    const newOtp = [...otp];
    for (let i = 0; i < OTP_LENGTH; i++) {
      if (digits[i]) {
        newOtp[i] = digits[i];
      }
    }
    setOtp(newOtp);
    onChange(newOtp.join(""));

    const focusTarget = Math.min(digits.length, OTP_LENGTH - 1);
    setActiveIndex(focusTarget);
    inputRefs.current[focusTarget]?.focus();
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 select-none">
      <div className="relative flex items-center gap-2.5 p-1.5 rounded-2xl bg-stone-100/60 dark:bg-stone-900/40 border border-stone-200/50 dark:border-stone-800/50 shadow-inner">
        {/* Sliding Liquid Backdrop */}
        <motion.div
          layoutId="liquidActiveGlow"
          className="absolute top-1.5 bottom-1.5 rounded-xl bg-[#bfa030]/15 dark:bg-[#bfa030]/20 border border-[#bfa030]/30 shadow-[0_0_12px_rgba(191,160,48,0.2)]"
          style={{
            width: "44px",
            left: `${6 + activeIndex * 54}px`, // Adjusted for 44px box + 10px gap (2.5rem = 10px spacing + 44px box)
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 30,
            mass: 0.8,
          }}
        />

        {otp.map((digit, index) => {
          const isActive = index === activeIndex;
          const hasValue = digit !== "";

          return (
            <div key={index} className="relative w-11 h-11 flex items-center justify-center">
              {/* Pulsing Liquid Ripple Ring */}
              {isActive && (
                <motion.div
                  layoutId="liquidRipple"
                  className="absolute inset-0 rounded-xl border border-[#bfa030]/50"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ 
                    scale: [0.95, 1.15, 0.95], 
                    opacity: [0.3, 0.1, 0.3],
                    borderRadius: ["35% 65% 70% 30% / 30% 40% 60% 70%", "60% 40% 30% 70% / 50% 60% 40% 50%", "35% 65% 70% 30% / 30% 40% 60% 70%"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Individual Input Box */}
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => handleFocus(index)}
                onPaste={handlePaste}
                className={`w-full h-full text-center font-mono font-black text-lg focus:outline-none rounded-xl transition-all duration-200 z-10 ${
                  isActive
                    ? "text-black dark:text-[#bfa030] scale-105"
                    : "text-stone-750 dark:text-stone-300"
                } ${
                  hasValue 
                    ? "bg-white dark:bg-stone-850 border border-[#bfa030]/20 shadow-sm" 
                    : "bg-transparent border border-transparent"
                }`}
                placeholder="•"
                style={{
                  caretColor: "#bfa030",
                }}
              />

              {/* Dynamic Bottom Dot/Indicator */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 z-10 pointer-events-none">
                <motion.div
                  animate={{
                    scale: isActive ? 1.5 : hasValue ? 0 : 1,
                    backgroundColor: isActive ? "#bfa030" : "rgb(168 162 158)", // stone-400
                    borderRadius: "50%",
                  }}
                  className="w-1 h-1"
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Helper text indicating active slot */}
      <div className="mt-2.5 text-[9px] font-mono uppercase tracking-widest text-stone-400 dark:text-stone-500">
        Digit <span className="font-extrabold text-[#bfa030]">{activeIndex + 1}</span> of 6
      </div>
    </div>
  );
}
