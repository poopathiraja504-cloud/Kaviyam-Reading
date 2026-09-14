/**
 * Security Hardening Utility
 * Enables dynamic injection of recommended security meta tags (like CSP and X-Frame-Options)
 * into the index.html head section to simulate browser-level security hardening in a client-side context.
 */

export interface SecurityMetaTagConfig {
  key: string;
  name: string;
  httpEquiv?: string;
  content: string;
  description: string;
  category: "Injection" | "Security Misconfiguration" | "Cryptographic Failures" | "Insecure Design";
  severity: "Critical" | "High" | "Medium" | "Low";
}

export const RECOMMENDED_META_TAGS: SecurityMetaTagConfig[] = [
  {
    key: "csp",
    name: "Content Security Policy (CSP)",
    httpEquiv: "Content-Security-Policy",
    content: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https: wss:; frame-ancestors 'self';",
    description: "Mitigates Cross-Site Scripting (XSS) and data injection attacks by restricting resource load origins.",
    category: "Injection",
    severity: "High"
  },
  {
    key: "xfo",
    name: "X-Frame-Options Simulation",
    httpEquiv: "X-Frame-Options",
    content: "SAMEORIGIN",
    description: "Simulates protection against Clickjacking. (Note: Most browsers require this as an HTTP response header; meta-tag injection acts as simulated enforcement).",
    category: "Insecure Design",
    severity: "Medium"
  },
  {
    key: "xcto",
    name: "X-Content-Type-Options",
    httpEquiv: "X-Content-Type-Options",
    content: "nosniff",
    description: "Prevents browsers from MIME-sniffing responses away from the declared content-type.",
    category: "Security Misconfiguration",
    severity: "Medium"
  },
  {
    key: "referrer",
    name: "Referrer Policy",
    httpEquiv: "Referrer-Policy",
    content: "strict-origin-when-cross-origin",
    description: "Controls how much referrer information is included with requests.",
    category: "Security Misconfiguration",
    severity: "Low"
  },
  {
    key: "hsts",
    name: "Strict-Transport-Security (HSTS) Simulation",
    httpEquiv: "Strict-Transport-Security",
    content: "max-age=31536000; includeSubDomains",
    description: "Declares that browsers should only interact with the site using secure HTTPS connections. (Simulated in client).",
    category: "Cryptographic Failures",
    severity: "High"
  },
  {
    key: "perms",
    name: "Permissions Policy",
    httpEquiv: "Permissions-Policy",
    content: "camera=(), microphone=(), geolocation=()",
    description: "Restricts access to browser device capabilities like camera, microphone, or location APIs.",
    category: "Insecure Design",
    severity: "Low"
  }
];

/**
 * Injects recommended security meta tags into the head section.
 * Removes them if enabled is false.
 * Supports an optional custom Content-Security-Policy (CSP) string.
 */
export function toggleSecurityMetaTags(enabled: boolean, customCsp?: string): { success: boolean; injectedCount: number; list: string[] } {
  const injectedList: string[] = [];
  
  RECOMMENDED_META_TAGS.forEach((tag) => {
    // Remove existing if any
    const existingElement = document.querySelector(`meta[http-equiv="${tag.httpEquiv}"]`);
    if (existingElement) {
      existingElement.remove();
    }

    if (enabled && tag.httpEquiv) {
      const meta = document.createElement("meta");
      meta.setAttribute("http-equiv", tag.httpEquiv);
      const contentValue = (tag.key === "csp" && customCsp) ? customCsp : tag.content;
      meta.setAttribute("content", contentValue);
      meta.setAttribute("data-simulated-security", "true");
      document.head.appendChild(meta);
      injectedList.push(tag.name);
    }
  });

  return {
    success: true,
    injectedCount: injectedList.length,
    list: injectedList
  };
}

/**
 * Checks if security meta tags are currently injected in the head section.
 */
export function areSecurityMetaTagsActive(): boolean {
  const elements = document.querySelectorAll('meta[data-simulated-security="true"]');
  return elements.length > 0;
}
