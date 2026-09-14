import { auth } from "../firebase";

export async function sendPhoneOtp(phoneNumber: string, recaptchaContainerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to send OTP" };
  }
}

export async function verifyPhoneOtp(otpCode: string): Promise<{ success: boolean; error?: string }> {
  try {
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to verify OTP" };
  }
}

export function clearRecaptchaVerifier(): void {
  // Recaptcha cleanup helper
}
