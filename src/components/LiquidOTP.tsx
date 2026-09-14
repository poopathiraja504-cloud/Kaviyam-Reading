import React, { useState, useRef, useEffect } from "react";
import { KeyRound, RefreshCw, CheckCircle2 } from "lucide-react";

interface LiquidOTPProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend?: () => void;
  disabled?: boolean;
  error?: string | null;
  initialCountdown?: number;
}

export default function LiquidOTP({
  length = 6,
  onComplete,
  onResend,
  disabled = false,
  error,
  initialCountdown = 60
}: LiquidOTPProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const [countdown, setCountdown] = useState(initialCountdown);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      const updated = [...digits];
      updated[index] = "";
      setDigits(updated);
      return;
    }

    const updated = [...digits];
    // In case user pasted or typed multiple digits
    const chars = clean.split("");
    let nextFocus = index;
    for (let i = 0; i < chars.length && index + i < length; i++) {
      updated[index + i] = chars[i];
      nextFocus = index + i + 1;
    }
    setDigits(updated);

    if (nextFocus < length) {
      inputRefs.current[nextFocus]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
    }

    const joined = updated.join("");
    if (joined.length === length) {
      onComplete(joined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasteData) return;

    const updated = [...digits];
    pasteData.split("").forEach((ch, i) => {
      updated[i] = ch;
    });
    setDigits(updated);

    const focusIdx = Math.min(pasteData.length, length - 1);
    inputRefs.current[focusIdx]?.focus();

    if (pasteData.length === length) {
      onComplete(pasteData);
    }
  };

  const handleResetAndResend = () => {
    if (!canResend) return;
    setDigits(Array(length).fill(""));
    setCountdown(initialCountdown);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    if (onResend) onResend();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-stone-400">
        <span className="flex items-center gap-1.5 font-medium text-stone-300">
          <KeyRound size={13} className="text-[#f0c15c]" />
          6 இலக்க ஒருமுறை கடவுச்சொல் (OTP)
        </span>
        <span>
          {countdown > 0 ? (
            <span className="font-mono text-[#f0c15c]">{countdown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResetAndResend}
              className="text-[#f0c15c] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={11} /> மறுஅனுப்பு (Resend)
            </button>
          )}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={`w-11 h-12 text-center text-lg font-bold font-mono rounded-xl bg-[#091325] border transition-all outline-none ${
              digit
                ? "border-[#f0c15c] text-[#f0c15c] shadow-[0_0_12px_rgba(240,193,92,0.2)]"
                : "border-stone-700 text-stone-200 focus:border-[#f0c15c]/80 focus:bg-[#0c1a33]"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            id={`otp-digit-${idx}`}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-400 font-mono text-center">{error}</p>
      )}

      {digits.every((d) => d !== "") && (
        <div className="flex items-center justify-center gap-1 text-xs text-emerald-400 font-medium">
          <CheckCircle2 size={13} />
          <span>OTP பூர்த்தி செய்யப்பட்டது</span>
        </div>
      )}
    </div>
  );
}
