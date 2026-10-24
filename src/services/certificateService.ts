export function generateCertificateId(prefix: string = "KVY"): string {
  const cleanPrefix = prefix.replace(/\s+/g, "").toUpperCase().slice(0, 4);
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `KVY-${cleanPrefix}-${timestamp}-${random}`;
}

export interface StoredCertificate {
  id: string;
  userId: string;
  userName: string;
  activityType: string;
  activityTitle: string;
  score: string;
  percentage: string;
  completionDate: string;
  createdAt: string;
}

export function saveCertificateToLocal(cert: StoredCertificate): void {
  try {
    const key = "kaviyam_certificates";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.unshift(cert);
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.error("Failed to save certificate locally:", e);
  }
}
