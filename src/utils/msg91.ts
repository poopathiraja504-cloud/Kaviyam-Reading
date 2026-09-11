// MSG91 / Phone91 SendOTP Web SDK Helper
export interface Msg91Config {
  widgetId: string;
  tokenAuth: string;
  identifier?: string;
  exposeMethods?: boolean | string;
  success: (data: any) => void;
  failure: (error: any) => void;
}

export const MSG91_CONFIG = {
  widgetId: "36696b686a32393534303537",
  tokenAuth: "569585TgwZWLIDRVc6aa3b7bcP1",
};

declare global {
  interface Window {
    configuration?: any;
    initSendOTP?: (config: any) => void;
    sendOtp?: (identifier: string, success: (data: any) => void, failure: (err: any) => void) => void;
  }
}

export const triggerMsg91Otp = (
  identifier?: string,
  onSuccess?: (data: any) => void,
  onFailure?: (error: any) => void
) => {
  if (typeof window === "undefined") return;

  const config = {
    widgetId: MSG91_CONFIG.widgetId,
    tokenAuth: MSG91_CONFIG.tokenAuth,
    identifier: identifier || "",
    exposeMethods: true,
    success: (data: any) => {
      console.log("MSG91 OTP verified response:", data);
      window.dispatchEvent(new CustomEvent("msg91-otp-success", { detail: { data, identifier } }));
      if (onSuccess) onSuccess(data);
    },
    failure: (error: any) => {
      console.error("MSG91 OTP failure:", error);
      window.dispatchEvent(new CustomEvent("msg91-otp-failure", { detail: { error, identifier } }));
      if (onFailure) onFailure(error);
    },
  };

  (window as any).configuration = config;

  if (typeof (window as any).initSendOTP === "function") {
    try {
      (window as any).initSendOTP(config);
    } catch (e) {
      console.warn("initSendOTP execution notice:", e);
    }
  } else {
    // Attempt loading scripts if not loaded yet
    loadMsg91Script(() => {
      if (typeof (window as any).initSendOTP === "function") {
        try {
          (window as any).initSendOTP(config);
        } catch (e) {
          console.warn("initSendOTP deferred execution notice:", e);
        }
      }
    });
  }
};

export const loadMsg91Script = (callback?: () => void) => {
  if (typeof window === "undefined") return;
  if (typeof (window as any).initSendOTP === "function") {
    if (callback) callback();
    return;
  }

  const urls = [
    "https://verify.msg91.com/otp-provider.js",
    "https://verify.phone91.com/otp-provider.js",
  ];
  let i = 0;
  function attempt() {
    const s = document.createElement("script");
    s.src = urls[i];
    s.async = true;
    s.onload = () => {
      if (typeof (window as any).initSendOTP === "function") {
        if ((window as any).configuration) {
          try {
            (window as any).initSendOTP((window as any).configuration);
          } catch (_) {}
        }
        if (callback) callback();
      }
    };
    s.onerror = () => {
      i++;
      if (i < urls.length) {
        attempt();
      }
    };
    document.head.appendChild(s);
  }
  attempt();
};
