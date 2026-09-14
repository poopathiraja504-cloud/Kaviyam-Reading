import {
  RecaptchaVerifier,
  ConfirmationResult,
  signInWithPhoneNumber,
  UserCredential,
} from "firebase/auth";
import { auth } from "../firebase";

const RECAPTCHA_CONTAINER_ID = "kaviyam-recaptcha-container";

// Singleton reference to the active RecaptchaVerifier
let activeVerifier: RecaptchaVerifier | null = null;
// Singleton reference to the active ConfirmationResult
let activeConfirmationResult: ConfirmationResult | null = null;
// In-flight dispatch lock to prevent duplicate clicks/requests
let isDispatchingOtp = false;

/**
 * Ensures a single stable DOM container exists for the invisible reCAPTCHA widget.
 * Note: We do NOT use display: 'none' as it prevents reCAPTCHA challenge rendering.
 */
const getOrCreateContainer = (): HTMLElement => {
  let container = document.getElementById(RECAPTCHA_CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = RECAPTCHA_CONTAINER_ID;
    container.style.position = "fixed";
    container.style.bottom = "0";
    container.style.right = "0";
    container.style.zIndex = "999999";
    document.body.appendChild(container);
  }
  return container;
};

/**
 * Safely clears the current RecaptchaVerifier instance and empties the container DOM element.
 */
export const clearRecaptchaVerifier = (): void => {
  if (activeVerifier) {
    try {
      activeVerifier.clear();
    } catch (err) {
      console.warn("RecaptchaVerifier clear warning:", err);
    }
    activeVerifier = null;
  }

  const container = document.getElementById(RECAPTCHA_CONTAINER_ID);
  if (container) {
    container.innerHTML = "";
  }
};

/**
 * Retrieves the existing valid RecaptchaVerifier or instantiates exactly one singleton instance.
 */
export const getOrCreateRecaptchaVerifier = (onExpired?: () => void): RecaptchaVerifier => {
  if (activeVerifier) {
    return activeVerifier;
  }

  const container = getOrCreateContainer();
  container.innerHTML = "";

  activeVerifier = new RecaptchaVerifier(auth, container, {
    size: "invisible",
    callback: () => {
      // Invisible reCAPTCHA verification solved
    },
    "expired-callback": () => {
      console.warn("reCAPTCHA token expired. Clearing verifier for clean retry.");
      clearRecaptchaVerifier();
      if (onExpired) {
        onExpired();
      }
    },
  });

  return activeVerifier;
};

/**
 * Formats and validates standard E.164 phone numbers (e.g. +919043533218).
 */
export const formatE164PhoneNumber = (countryCode: string, rawNumber: string): string => {
  const cleanCode = countryCode.trim().startsWith("+")
    ? countryCode.trim()
    : `+${countryCode.trim()}`;

  let cleanDigits = rawNumber.trim().replace(/[\s\-()]/g, "");
  // Strip leading 0 if present (e.g., 09043533218 -> 9043533218)
  if (cleanDigits.startsWith("0")) {
    cleanDigits = cleanDigits.replace(/^0+/, "");
  }

  const fullNumber = `${cleanCode}${cleanDigits}`;

  // Validate E.164: + followed by 7 to 15 digits
  if (!/^\+[1-9]\d{6,14}$/.test(fullNumber)) {
    throw new Error(
      `Please enter a valid mobile number with country code (e.g. ${cleanCode}9043533218).`
    );
  }

  return fullNumber;
};

/**
 * Dispatches real Firebase Phone SMS OTP using the stable RecaptchaVerifier.
 */
export const sendPhoneOtp = async (
  fullE164Phone: string,
  onExpired?: () => void
): Promise<ConfirmationResult> => {
  if (isDispatchingOtp) {
    throw new Error("An SMS verification request is currently in progress. Please wait.");
  }

  const trimmedPhone = fullE164Phone.trim().replace(/\s+/g, "");
  if (!/^\+[1-9]\d{6,14}$/.test(trimmedPhone)) {
    throw new Error("Invalid phone number format. Please provide a valid E.164 number (e.g. +919043533218).");
  }

  isDispatchingOtp = true;
  try {
    const verifier = getOrCreateRecaptchaVerifier(onExpired);
    const confirmation = await signInWithPhoneNumber(auth, trimmedPhone, verifier);
    activeConfirmationResult = confirmation;
    return confirmation;
  } catch (error: any) {
    // If sending fails (e.g. network, quota, or captcha issue), safely clear verifier for the next attempt
    clearRecaptchaVerifier();
    throw error;
  } finally {
    isDispatchingOtp = false;
  }
};

/**
 * Confirms the entered SMS OTP against the real Firebase ConfirmationResult.
 */
export const verifyPhoneOtp = async (otp: string): Promise<UserCredential> => {
  const cleanOtp = otp.trim();
  if (!cleanOtp || cleanOtp.length < 6) {
    throw new Error("Please enter the complete 6-digit verification code.");
  }

  if (!activeConfirmationResult) {
    throw new Error("No active phone verification session found. Please request an SMS verification code first.");
  }

  try {
    const credential = await activeConfirmationResult.confirm(cleanOtp);
    // On success, reset the confirmation session and clear the verifier
    activeConfirmationResult = null;
    clearRecaptchaVerifier();
    return credential;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Returns the currently active ConfirmationResult if one exists.
 */
export const getActiveConfirmationResult = (): ConfirmationResult | null => {
  return activeConfirmationResult;
};
