import { jsPDF } from "jspdf";
import { Language } from "./i18n";

export interface CertificateParams {
  participantName: string;
  activityType: string;
  activityTitle: string;
  wordsFound?: string;
  completionTime?: string;
  score?: string;
  percentage?: string;
  completionDate?: string;
  certificateId: string;
  userId?: string;
  lang?: Language;
}

export function renderCertificateOnCanvas(
  canvas: HTMLCanvasElement,
  params: CertificateParams
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = 1200;
  const height = 840;
  canvas.width = width;
  canvas.height = height;

  const isTamil = params.lang === "ta";

  // Background
  ctx.fillStyle = "#FFFDF9";
  ctx.fillRect(0, 0, width, height);

  // Subtle parchment texture simulation
  const grad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, 700);
  grad.addColorStop(0, "#FFFFFF");
  grad.addColorStop(0.7, "#FAF5EB");
  grad.addColorStop(1, "#EFE7D5");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Outer Border (Gold)
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 10;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Inner Border (Burgundy/Crimson)
  ctx.strokeStyle = "#3B0B12";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(38, 38, width - 76, height - 76);

  // Thin Accent Border
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 1;
  ctx.strokeRect(44, 44, width - 88, height - 88);

  // Corner Ornaments
  const drawCorner = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#D4AF37";
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3B0B12";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  drawCorner(44, 44);
  drawCorner(width - 44, 44);
  drawCorner(44, height - 44);
  drawCorner(width - 44, height - 44);

  // Top Header / Seal
  ctx.textAlign = "center";

  // Platform Branding
  ctx.font = "bold 20px 'Cinzel', 'Noto Serif Tamil', serif";
  ctx.fillStyle = "#8C6D23";
  ctx.fillText("✨  காவியம் தமிழ் இலக்கிய வாசிப்புத் தளம்  ✨", width / 2, 95);
  ctx.font = "600 13px sans-serif";
  ctx.fillStyle = "#78716C";
  ctx.fillText("KAVIYAM DIGITAL TAMIL LITERATURE & HERITAGE ACADEMY", width / 2, 120);

  // Divider ribbon
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, 138);
  ctx.lineTo(width / 2 + 200, 138);
  ctx.stroke();

  // Certificate Title
  ctx.font = "900 42px 'Noto Serif Tamil', 'Playfair Display', serif";
  ctx.fillStyle = "#3B0B12";
  const titleText = isTamil ? "வெற்றிச் சான்றிதழ்" : "CERTIFICATE OF EXCELLENCE";
  ctx.fillText(titleText, width / 2, 195);

  ctx.font = "italic 16px 'Noto Serif Tamil', serif";
  ctx.fillStyle = "#6B7280";
  const subTitle = isTamil
    ? "இச்சான்றிதழ் பெருமையுடன் வழங்கப்படுகிறது"
    : "This is proudly presented to";
  ctx.fillText(subTitle, width / 2, 230);

  // Participant Name (Big & Bold)
  ctx.font = "bold 46px 'Cinzel', 'Noto Serif Tamil', serif";
  ctx.fillStyle = "#5C121E";
  const name = params.participantName || (isTamil ? "வாசகர்" : "Honored Reader");
  ctx.fillText(name, width / 2, 300);

  // Underline beneath participant name
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 2;
  ctx.beginPath();
  const nameWidth = ctx.measureText(name).width;
  ctx.moveTo(width / 2 - Math.max(160, nameWidth / 2 + 30), 315);
  ctx.lineTo(width / 2 + Math.max(160, nameWidth / 2 + 30), 315);
  ctx.stroke();

  // Achievement Description
  ctx.font = "normal 18px 'Noto Serif Tamil', sans-serif";
  ctx.fillStyle = "#292524";
  const activityLabel = isTamil
    ? params.activityType === "Word Finder"
      ? "சொல் வேட்டை"
      : "வினாடி வினா"
    : params.activityType;

  const descText = isTamil
    ? `காவியம் தளத்தில் ${activityLabel} பிரிவில் "${params.activityTitle}" புதிரை சிறப்பாக நிறைவு செய்து சாதனை புரிந்துள்ளார்.`
    : `For outstanding achievement and successfully completing "${params.activityTitle}" in the ${activityLabel} challenge.`;
  ctx.fillText(descText, width / 2, 365);

  // Stats Card Box in the center
  const boxW = 860;
  const boxH = 100;
  const boxX = (width - boxW) / 2;
  const boxY = 405;

  ctx.fillStyle = "#FAF7F0";
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Stats Columns
  const colW = boxW / 4;
  const stats = [
    {
      label: isTamil ? "கண்டுபிடித்தவை" : "Words / Items",
      value: params.wordsFound || "5 / 5",
    },
    {
      label: isTamil ? "எடுத்த நேரம்" : "Time Taken",
      value: params.completionTime || "02:15",
    },
    {
      label: isTamil ? "மதிப்பெண்" : "Total Score",
      value: `${params.score || "100"} pts`,
    },
    {
      label: isTamil ? "தேர்ச்சி" : "Percentage",
      value: params.percentage || "100%",
    },
  ];

  stats.forEach((st, idx) => {
    const cx = boxX + colW * idx + colW / 2;
    ctx.font = "600 12px sans-serif";
    ctx.fillStyle = "#78716C";
    ctx.fillText(st.label, cx, boxY + 36);

    ctx.font = "bold 22px 'Noto Serif Tamil', serif";
    ctx.fillStyle = "#3B0B12";
    ctx.fillText(st.value, cx, boxY + 70);

    if (idx < 3) {
      ctx.strokeStyle = "#E7E2D6";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(boxX + colW * (idx + 1), boxY + 15);
      ctx.lineTo(boxX + colW * (idx + 1), boxY + boxH - 15);
      ctx.stroke();
    }
  });

  // Security & Date info
  ctx.font = "normal 14px 'Noto Serif Tamil', sans-serif";
  ctx.fillStyle = "#57534E";
  const dateStr = params.completionDate || new Date().toLocaleDateString(isTamil ? "ta-IN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  ctx.fillText(
    `${isTamil ? "வழங்கப்பட்ட தேதி" : "Date of Award"}: ${dateStr}`,
    width / 2,
    550
  );

  // Certificate ID badge
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillStyle = "#8C6D23";
  ctx.fillText(`VERIFIED ID: ${params.certificateId}`, width / 2, 575);

  // Bottom Signatures & Seal
  const sigY = 700;

  // Left side: Signature of Founder
  ctx.textAlign = "center";
  ctx.font = "italic bold 18px 'Playfair Display', serif";
  ctx.fillStyle = "#3B0B12";
  ctx.fillText("S. Dharmenthira Boopathi", 260, sigY);

  ctx.strokeStyle = "#3B0B12";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(140, sigY + 8);
  ctx.lineTo(380, sigY + 8);
  ctx.stroke();

  ctx.font = "600 12px 'Noto Serif Tamil', sans-serif";
  ctx.fillStyle = "#78716C";
  ctx.fillText(isTamil ? "எஸ். தர்மேந்திர பூபதி" : "S. Dharmenthira Boopathi", 260, sigY + 28);
  ctx.font = "normal 11px 'Noto Serif Tamil', sans-serif";
  ctx.fillText(isTamil ? "நிறுவனர், காவியம் வாசிப்புத் தளம்" : "Founder, Kaviyam Platform", 260, sigY + 44);

  // Center: Gold Seal Stamp
  const sealX = width / 2;
  const sealY = sigY + 5;
  ctx.save();
  ctx.translate(sealX, sealY);
  ctx.fillStyle = "#FAF5EB";
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = "#3B0B12";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = "bold 10px sans-serif";
  ctx.fillStyle = "#D4AF37";
  ctx.fillText("★ OFFICIAL ★", 0, -8);
  ctx.font = "bold 11px sans-serif";
  ctx.fillStyle = "#3B0B12";
  ctx.fillText("SEAL", 0, 8);
  ctx.font = "9px sans-serif";
  ctx.fillStyle = "#8C6D23";
  ctx.fillText("VERIFIED", 0, 22);
  ctx.restore();

  // Right side: Seal & Verification
  ctx.font = "bold 14px 'Noto Serif Tamil', sans-serif";
  ctx.fillStyle = "#3B0B12";
  ctx.fillText(isTamil ? "காவியம் கல்விச் சபை" : "Kaviyam Academic Council", width - 260, sigY);

  ctx.strokeStyle = "#3B0B12";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width - 380, sigY + 8);
  ctx.lineTo(width - 140, sigY + 8);
  ctx.stroke();

  ctx.font = "600 12px sans-serif";
  ctx.fillStyle = "#78716C";
  ctx.fillText("Certified Digital Archive", width - 260, sigY + 28);
  ctx.font = "normal 11px sans-serif";
  ctx.fillText("secure.kaviyam.app", width - 260, sigY + 44);
}

export async function downloadCertificateAsPng(params: CertificateParams): Promise<void> {
  const canvas = document.createElement("canvas");
  renderCertificateOnCanvas(canvas, params);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kaviyam_certificate_${params.certificateId || "award"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

export async function downloadCertificateAsPdf(params: CertificateParams): Promise<void> {
  const canvas = document.createElement("canvas");
  renderCertificateOnCanvas(canvas, params);
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1200, 840],
  });

  doc.addImage(imgData, "JPEG", 0, 0, 1200, 840);
  doc.save(`kaviyam_certificate_${params.certificateId || "award"}.pdf`);
}
