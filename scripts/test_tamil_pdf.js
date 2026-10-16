import fs from 'fs';
import { jsPDF } from 'jspdf';

try {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const fontBase64 = fs.readFileSync('public/fonts/NotoSansTamil.ttf').toString('base64');
  doc.addFileToVFS('NotoSansTamil.ttf', fontBase64);
  doc.addFont('NotoSansTamil.ttf', 'NotoSansTamil', 'normal');
  doc.setFont('NotoSansTamil');
  doc.setFontSize(22);
  doc.text('முற்றம் Vol 28 No 3 - ஜூலை 2026', 40, 60);
  doc.setFontSize(14);
  doc.text('காவியம் ரீடிங் - தமிழ் டிஜிட்டல் நூலகம்', 40, 90);
  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync('public/books/test.pdf', Buffer.from(pdfBytes));
  console.log('PDF generated successfully, bytes:', pdfBytes.byteLength);
} catch (e) {
  console.error('Error generating PDF:', e);
}
