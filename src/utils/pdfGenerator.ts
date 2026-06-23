import { jsPDF } from 'jspdf';
import { EnrollmentState } from '../types';

export interface ManualCertData {
  studentName: string;
  registrationNo: string;
  collegeName: string;
  domainTitle: string;
  durationWeeks: number;
  trainingMode: string;
  startDate: string;
  issuedDate: string;
  grade: string;
}

// ─── Image Cache ───
const imageCache: Record<string, string> = {};

async function getBase64ImageFromUrl(url: string): Promise<string | null> {
  if (imageCache[url]) return imageCache[url];
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageCache[url] = reader.result as string;
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Failed to load image', url, err);
    return null;
  }
}

// ─── Helper: Draw QR code pattern ───
function drawQRCode(doc: jsPDF, x: number, y: number, size: number, data: string) {
  const cellSize = size / 25;
  const hash = data.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const drawFinder = (fx: number, fy: number) => {
    doc.setFillColor(0, 0, 0);
    doc.rect(fx, fy, cellSize * 7, cellSize * 7, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(fx + cellSize, fy + cellSize, cellSize * 5, cellSize * 5, 'F');
    doc.setFillColor(0, 0, 0);
    doc.rect(fx + cellSize * 2, fy + cellSize * 2, cellSize * 3, cellSize * 3, 'F');
  };
  drawFinder(x, y);
  drawFinder(x + cellSize * 18, y);
  drawFinder(x, y + cellSize * 18);
  doc.setFillColor(0, 0, 0);
  for (let row = 0; row < 25; row++) {
    for (let col = 0; col < 25; col++) {
      if ((row < 8 && col < 8) || (row < 8 && col > 16) || (row > 16 && col < 8)) continue;
      const seed = (hash + row * 31 + col * 37) % 100;
      if (seed < 45) {
        doc.rect(x + col * cellSize, y + row * cellSize, cellSize, cellSize, 'F');
      }
    }
  }
}

// ─── Helper: format date nicely ───
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ─── Helper: calculate end date ───
function getEndDate(startDate: string, durationWeeks: number): string {
  try {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000);
    return end.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return startDate;
  }
}

// ─── Core: render mixed bold/normal line centered ───
function renderCenteredLine(
  doc: jsPDF,
  segments: Array<{ text: string; bold: boolean }>,
  y: number,
  centerX: number,
  fontSize: number
) {
  doc.setFontSize(fontSize);
  let totalWidth = 0;
  segments.forEach(seg => {
    doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
    totalWidth += doc.getTextWidth(seg.text);
  });

  let x = centerX - totalWidth / 2;
  segments.forEach(seg => {
    doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(seg.text, x, y);
    x += doc.getTextWidth(seg.text);
  });
}

function drawRotatedRect(doc: jsPDF, cx: number, cy: number, width: number, height: number, angleDeg: number, color: [number, number, number]) {
  const rad = angleDeg * Math.PI / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const hw = width / 2;
  const hh = height / 2;
  const pts = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh]
  ].map(([vx, vy]) => [
    cx + vx * cos - vy * sin,
    cy + vx * sin + vy * cos
  ]);
  doc.setFillColor(...color);
  doc.triangle(pts[0][0], pts[0][1], pts[1][0], pts[1][1], pts[2][0], pts[2][1], 'F');
  doc.triangle(pts[0][0], pts[0][1], pts[2][0], pts[2][1], pts[3][0], pts[3][1], 'F');
}

// ─── Build Certificate function ───
async function buildCertificate(
  doc: jsPDF,
  opts: {
    studentName: string;
    registrationNo: string;
    collegeName: string;
    domainTitle: string;
    durationWeeks: number;
    trainingMode: string;
    startDate: string;
    issuedDate: string;
    grade: string;
    certNo: string;
  }
) {
  const W = 297;
  const H = 210;
  const CX = W / 2;

  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // Single inner border matching the sample exactly
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.6);
  doc.roundedRect(12, 12, W - 24, H - 24, 15, 15, 'S');

  const fillQuad = (pts: [number, number][], rgb: [number, number, number]) => {
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.triangle(pts[0][0], pts[0][1], pts[1][0], pts[1][1], pts[2][0], pts[2][1], 'F');
    if (pts.length === 4) {
      doc.triangle(pts[0][0], pts[0][1], pts[2][0], pts[2][1], pts[3][0], pts[3][1], 'F');
    }
  };

  const green: [number, number, number]  = [109, 179, 63];
  const yellow: [number, number, number] = [242, 193, 13];
  const red: [number, number, number]    = [237, 28, 36];
  const blue: [number, number, number]   = [59, 107, 198];

  // Top-Left corner ribbons (angle 135)
  fillQuad([[0, 0], [35, 0], [0, 35]], green);
  drawRotatedRect(doc, 25, 25, 100, 5, 135, yellow);
  drawRotatedRect(doc, 50, 15, 60, 14, 135, red);
  drawRotatedRect(doc, 15, 60, 80, 25, 135, blue);

  // Bottom-Right corner ribbons (angle 135)
  fillQuad([[W, H], [W - 35, H], [W, H - 35]], yellow);
  drawRotatedRect(doc, W - 25, H - 25, 100, 5, 135, green);
  drawRotatedRect(doc, W - 50, H - 15, 60, 14, 135, red);
  drawRotatedRect(doc, W - 15, H - 60, 80, 25, 135, blue);

  // Top URL
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text('Certificate Verification: https://www.invigoinfotech.in/verification    INVIGO EDUCARE PVT. LTD', W / 2, 8, { align: 'center' });

  // ─── Fetch and draw images (Bigger sizes) ───
  const logoY = 24;

  const msmeImg = await getBase64ImageFromUrl('/msme_logo.png');
  if (msmeImg) doc.addImage(msmeImg, 'PNG', 45, logoY - 4, 40, 20);

  const mcaImg = await getBase64ImageFromUrl('/MInistory_of_corporate_affairs.jpeg');
  if (mcaImg) doc.addImage(mcaImg, 'JPEG', 100, logoY - 7, 26, 26);

  const isoImg = await getBase64ImageFromUrl('/ISO_Logo.png');
  if (isoImg) doc.addImage(isoImg, 'PNG', 145, logoY - 5, 24, 24);

  const dpiitImg = await getBase64ImageFromUrl('/DPIIT_startup_india.png');
  if (dpiitImg) doc.addImage(dpiitImg, 'PNG', 185, logoY - 2, 45, 16);

  const invigoLogoImg = await getBase64ImageFromUrl('/logo.jpg');
  if (invigoLogoImg) doc.addImage(invigoLogoImg, 'JPEG', 245, logoY - 5, 22, 22);

  // ─── Title ───
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text('Certificate of Completion', W / 2, 65, { align: 'center' });

  // ─── Auto-Wrapping Body Text ───
  const FS = 13;
  const LS = 11; 
  let y = 85;

  const startFmt  = formatDate(opts.startDate);
  const endFmt    = getEndDate(opts.startDate, opts.durationWeeks);
  const modeText  = opts.trainingMode.charAt(0).toUpperCase() + opts.trainingMode.slice(1);
  const remDate = startFmt.split(' ').slice(1).join(' ') + '- ' + endFmt;

  // Function to perfectly wrap and center mixed bold/normal text
  const wrapAndCenterText = (textObjArr: Array<{ text: string, bold: boolean }>, yStart: number, lineH: number, maxW: number) => {
    let lines: Array<Array<{ text: string, bold: boolean, w: number }>> = [[]];
    let currentLineW = 0;

    for (const seg of textObjArr) {
      doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
      doc.setFontSize(FS);
      const words = seg.text.split(/( )/); // split by spaces but keep the spaces

      for (const word of words) {
        if (!word) continue;
        doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
        const w = doc.getTextWidth(word);
        
        // Wrap if line is too long
        if (word !== ' ' && currentLineW + w > maxW && lines[lines.length - 1].length > 0) {
          lines.push([]);
          currentLineW = 0;
        }

        const curLine = lines[lines.length - 1];
        if (curLine.length > 0 && curLine[curLine.length - 1].bold === seg.bold) {
          curLine[curLine.length - 1].text += word;
          curLine[curLine.length - 1].w += w;
        } else {
          if (word === ' ' && currentLineW === 0) continue; // skip leading spaces on new line
          curLine.push({ text: word, bold: seg.bold, w: w });
        }
        currentLineW += w;
      }
    }

    let curY = yStart;
    for (const line of lines) {
      let lw = line.reduce((acc, s) => acc + s.w, 0);
      let x = CX - lw / 2;
      for (const seg of line) {
        doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
        doc.text(seg.text, x, curY);
        x += seg.w;
      }
      curY += lineH;
    }
    return curY;
  };

  const bodyParagraph = [
    { text: 'This is to Certify that ', bold: false },
    { text: opts.studentName, bold: true },
    { text: ', Reg no- ', bold: false },
    { text: opts.registrationNo, bold: true },
    { text: ' of ', bold: false },
    { text: opts.collegeName, bold: true },
    { text: ' has successfully completed a ', bold: false },
    { text: `${opts.durationWeeks} Weeks ${modeText} Training `, bold: true },
    { text: 'program on ', bold: false },
    { text: `"${opts.domainTitle}" `, bold: true },
    { text: 'during ( ', bold: false },
    { text: startFmt.split(' ')[0] + ' ' + remDate + ' ) ', bold: true },
    { text: 'in ', bold: false },
    { text: 'Invigo Infotech', bold: true },
    { text: '. We found the candidate sincere, hardworking, technically sound & result oriented and Scored ', bold: false },
    { text: opts.grade, bold: true },
    { text: ' in the Assessment test. ', bold: false },
    { text: 'We wish them all the best for future endeavors.', bold: false }
  ];

  y = wrapAndCenterText(bodyParagraph, y, LS, 210);

  // ─── Footer ───
  y += 20; // Margin before footer elements
  const issuedFmt = formatDate(opts.issuedDate);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  
  // Position "Issued on" exactly in the center (moved more upper)
  doc.text('Issued on ' + issuedFmt, CX, y - 18, { align: 'center' });

  // Seal (Congrat Batch) directly to the right of "Issued on" (moved more upper and smaller)
  const sealImg = await getBase64ImageFromUrl('/Congrat_batch.png');
  if (sealImg) {
    doc.addImage(sealImg, 'PNG', CX + 45, y - 29, 18, 18);
  }

  const bottomY = H - 32;

  // Signature (Left side)
  const signImg = await getBase64ImageFromUrl('/Founder_Singnature.png');
  if (signImg) {
    doc.addImage(signImg, 'PNG', 35, bottomY - 22, 46, 20);
  }
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.line(20, bottomY + 2, 90, bottomY + 2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Founder ( Invigo Infotech )', 55, bottomY + 8, { align: 'center' });

  // Purnea Stamp perfectly centered below the "Issued on" date
  const stampImg = await getBase64ImageFromUrl('/Stamp.png');
  if (stampImg) {
    // 36x36 image at CX - 18 is perfectly centered
    doc.addImage(stampImg, 'PNG', CX - 18, bottomY - 22, 36, 36);
  }

  // QR Code (Moved more to the left to avoid bottom-right ribbons)
  const qrX = W - 92;
  const qrImg = await getBase64ImageFromUrl('/Certificate_Verification_qr.jpeg');
  if (qrImg) {
    doc.addImage(qrImg, 'JPEG', qrX, bottomY - 20, 24, 24);
  } else {
    drawQRCode(doc, qrX, bottomY - 20, 24, opts.certNo);
  }

  // Cert Number right below QR Code
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Certificate no: ' + opts.certNo, qrX + 12, bottomY + 6, { align: 'center' });
}

// ═══════════════════════════════════════════════
// MANUAL CERTIFICATE GENERATOR
// ═══════════════════════════════════════════════
export async function generateManualCertificatePDF(data: ManualCertData): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const year2 = new Date(data.issuedDate).getFullYear().toString().slice(-2);
  const certNo = `${year2}IN${data.registrationNo}`;
  
  await buildCertificate(doc, {
    studentName: data.studentName,
    registrationNo: data.registrationNo,
    collegeName: data.collegeName,
    domainTitle: data.domainTitle,
    durationWeeks: data.durationWeeks,
    trainingMode: data.trainingMode,
    startDate: data.startDate,
    issuedDate: data.issuedDate,
    grade: data.grade,
    certNo,
  });

  doc.save(`Certificate_${data.studentName.replace(/\s+/g, '_')}.pdf`);
}

// ═══════════════════════════════════════════════
// ENROLLMENT-BASED CERTIFICATE
// ═══════════════════════════════════════════════
export async function downloadCertificatePDF(cert: EnrollmentState, domainTitle: string): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const regNo = cert.registrationNo || cert.candidateId;
  const issuedDate = cert.certificateDate
    ? (() => {
      const d = new Date(cert.certificateDate);
      return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
    })()
    : new Date().toISOString().split('T')[0];

  const year2 = new Date(issuedDate).getFullYear().toString().slice(-2);
  const certNo = `${year2}IN${regNo}`;
  const scoreText = cert.testScore && cert.testScore >= 80 ? 'Excellent' : cert.testScore && cert.testScore >= 60 ? 'Good' : 'Good';

  await buildCertificate(doc, {
    studentName: cert.fullName,
    registrationNo: regNo,
    collegeName: cert.collegeName,
    domainTitle,
    durationWeeks: cert.durationWeeks,
    trainingMode: cert.trainingMode || 'offline',
    startDate: cert.startDate,
    issuedDate,
    grade: scoreText,
    certNo,
  });

  doc.save(`Certificate_InvigoInfotech_${cert.fullName.replace(/\s+/g, '_')}.pdf`);
}

// ═══════════════════════════════════════════════
// OFFER LETTER PDF (unchanged)
// ═══════════════════════════════════════════════
export function downloadOfferLetterPDF(offer: EnrollmentState, domainTitle: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, marginX = 20;
  let currentY = 12;

  doc.setFillColor(30, 58, 138); doc.rect(0, 0, W, 4, 'F');
  doc.setFillColor(220, 38, 38); doc.rect(0, 0, 3, 40, 'F');
  doc.setFillColor(34, 197, 94); doc.rect(4, 0, 3, 30, 'F');
  doc.setFillColor(234, 179, 8); doc.rect(8, 0, 3, 20, 'F');
  currentY += 8;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
  doc.setTextColor(30, 58, 138); doc.text('INVIGO INFOTECH', marginX, currentY + 6);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
  doc.text('Internship & Skill Development Platform', marginX, currentY + 11);
  doc.text('Web: www.invigoinfotech.in | Email: info@invigoinfotech.in', marginX, currentY + 15);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(37, 99, 235);
  doc.text('ISO 9001:2015 Certified', W - marginX - 35, currentY + 6);
  doc.text('MSME Registered', W - marginX - 28, currentY + 11);
  currentY += 22;

  doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.5);
  doc.line(marginX, currentY, W - marginX, currentY); currentY += 8;

  doc.setFont('times', 'bolditalic'); doc.setFontSize(18);
  doc.setTextColor(30, 58, 138); doc.text('Internship Offer Letter', W / 2, currentY, { align: 'center' });
  currentY += 4;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(71, 85, 105);
  doc.text(`Reference ID: ${offer.candidateId}`, marginX, currentY + 4);
  doc.text(`Date: ${offer.enrollmentDate}`, W - marginX, currentY + 4, { align: 'right' });
  currentY += 12;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginX, currentY, W - marginX * 2, 50, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, currentY, W - marginX * 2, 50, 3, 3, 'S');
  const gx1 = marginX + 5, gx2 = 115;
  let gy = currentY + 6;
  const addField = (label: string, value: string, x: number, y: number) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(15, 23, 42);
    doc.text(value, x, y + 4);
  };
  addField('CANDIDATE NAME:', offer.fullName.toUpperCase(), gx1, gy);
  addField('EMAIL:', offer.email, gx1, gy + 12);
  addField('COLLEGE:', offer.collegeName.length > 35 ? offer.collegeName.slice(0, 32) + '...' : offer.collegeName, gx1, gy + 24);
  addField('PAYMENT:', `Rs. ${offer.amountPaid || '0'} Paid`, gx1, gy + 36);
  addField('DOMAIN:', domainTitle, gx2, gy);
  addField('DURATION:', `${offer.durationWeeks} Weeks from ${offer.startDate}`, gx2, gy + 12);
  addField('MODE:', offer.trainingMode === 'online' ? 'Online' : 'Offline', gx2, gy + 24);
  addField('DEGREE:', `${offer.degree}`, gx2, gy + 36);
  currentY += 60;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(15, 23, 42);
  doc.text(`Dear ${offer.fullName},`, marginX, currentY); currentY += 8;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(51, 65, 85);
  const paragraphs = [
    `On behalf of Invigo Infotech, we are pleased to offer you the position of Intern in the ${domainTitle} domain. This is a structured internship program designed to strengthen your practical skills and professional capabilities.`,
    `Throughout your ${offer.durationWeeks}-week internship, you will complete progressive milestones under the guidance of our experienced mentors. The program includes structured project modules, progress assessments, and hands-on exercises with industry-standard tools.`,
    `Upon successful completion of all milestones and passing the assessment test (minimum 60% score required), you will receive a verified Certificate of Completion with a unique certificate code for employer verification.`,
    `We look forward to having you as part of our learning community. Please access the Student Portal to track your progress and submit your work.`
  ];
  paragraphs.forEach((text) => {
    const w = doc.splitTextToSize(text, W - marginX * 2);
    doc.text(w, marginX, currentY); currentY += w.length * 5 + 3;
  });
  currentY += 8;
  doc.setDrawColor(226, 232, 240); doc.line(marginX, currentY, W - marginX, currentY); currentY += 8;
  doc.setFont('times', 'italic'); doc.setFontSize(14); doc.setTextColor(15, 23, 42);
  doc.text('Priyanshu Kumar', marginX, currentY); currentY += 5;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('Founder, Invigo Infotech', marginX, currentY);
  drawQRCode(doc, W - marginX - 20, currentY - 15, 18, offer.candidateId);
  currentY = H - 15;
  doc.setDrawColor(226, 232, 240); doc.line(marginX, currentY, W - marginX, currentY);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(148, 163, 184);
  doc.text('This offer letter is electronically generated by Invigo Infotech and does not require a physical signature.', W / 2, currentY + 4, { align: 'center' });
  doc.text(`Verification: https://www.invigoinfotech.in/verification | Ref: ${offer.candidateId}`, W / 2, currentY + 8, { align: 'center' });
  doc.setFillColor(30, 58, 138); doc.rect(0, H - 3, W, 3, 'F');
  doc.save(`Offer_Letter_InvigoInfotech_${offer.fullName.replace(/\s+/g, '_')}.pdf`);
}

// ═══════════════════════════════════════════════
// ACCEPTANCE LETTER PDF (unchanged)
// ═══════════════════════════════════════════════
export function downloadAcceptanceLetterPDF(enrollment: EnrollmentState, domainTitle: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, marginX = 20;
  let currentY = 12;
  doc.setFillColor(16, 185, 129); doc.rect(0, 0, W, 4, 'F');
  doc.setFillColor(34, 197, 94); doc.rect(0, 0, 3, 40, 'F');
  doc.setFillColor(59, 130, 246); doc.rect(4, 0, 3, 30, 'F');
  doc.setFillColor(234, 179, 8); doc.rect(8, 0, 3, 20, 'F');
  currentY += 8;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(30, 58, 138);
  doc.text('INVIGO INFOTECH', marginX, currentY + 6);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
  doc.text('Internship & Skill Development Platform', marginX, currentY + 11);
  doc.text('Web: www.invigoinfotech.in | Email: info@invigoinfotech.in', marginX, currentY + 15);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(16, 185, 129);
  doc.text('ISO 9001:2015 Certified', W - marginX - 35, currentY + 6);
  currentY += 22;
  doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.5);
  doc.line(marginX, currentY, W - marginX, currentY); currentY += 8;
  doc.setFont('times', 'bolditalic'); doc.setFontSize(18); doc.setTextColor(16, 185, 129);
  doc.text('Internship Acceptance Letter', W / 2, currentY, { align: 'center' });
  currentY += 4;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(71, 85, 105);
  doc.text(`Reference ID: ${enrollment.candidateId}`, marginX, currentY + 4);
  doc.text(`Date: ${enrollment.enrollmentDate}`, W - marginX, currentY + 4, { align: 'right' });
  currentY += 12;
  doc.setFillColor(240, 253, 244); doc.roundedRect(marginX, currentY, W - marginX * 2, 40, 3, 3, 'F');
  doc.setDrawColor(187, 247, 208); doc.roundedRect(marginX, currentY, W - marginX * 2, 40, 3, 3, 'S');
  const gx1b = marginX + 5, gx2b = 115;
  let gy2 = currentY + 6;
  const addF2 = (label: string, value: string, x: number, y: number, color?: [number, number, number]) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(100, 116, 139); doc.text(label, x, y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(color ? 10 : 9);
    doc.setTextColor(color ? color[0] : 15, color ? color[1] : 23, color ? color[2] : 42);
    doc.text(value, x, y + 4);
  };
  addF2('INTERN NAME:', enrollment.fullName, gx1b, gy2);
  const col = enrollment.collegeName.length > 35 ? enrollment.collegeName.slice(0, 32) + '...' : enrollment.collegeName;
  addF2('COLLEGE:', `${enrollment.degree}, ${col}`, gx1b, gy2 + 12);
  addF2('START DATE:', enrollment.startDate, gx1b, gy2 + 26);
  addF2('INTERNSHIP DOMAIN:', domainTitle, gx2b, gy2, [16, 185, 129]);
  addF2('DURATION:', `${enrollment.durationWeeks} Weeks | ${enrollment.trainingMode === 'offline' ? 'Offline' : 'Online'}`, gx2b, gy2 + 12);
  addF2('STATUS:', 'ACCEPTED', gx2b, gy2 + 26, [16, 185, 129]);
  currentY += 50;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(15, 23, 42);
  doc.text(`Dear ${enrollment.fullName},`, marginX, currentY); currentY += 8;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(51, 65, 85);
  const ap = [
    `We are pleased to confirm that your application for the ${domainTitle} internship program at Invigo Infotech has been reviewed and accepted.`,
    `Your internship is scheduled to begin on ${formatDate(enrollment.startDate)} and will span ${enrollment.durationWeeks} weeks.`,
    `As an accepted intern, you are expected to complete all assigned weekly milestones, maintain regular communication, submit all deliverables before the deadline, and pass the final MCQ assessment with a minimum score of 60%.`,
    `Upon successful completion, you will receive a verified Certificate of Completion. We look forward to supporting your growth and success.`
  ];
  ap.forEach(text => {
    const w = doc.splitTextToSize(text, W - marginX * 2);
    doc.text(w, marginX, currentY); currentY += w.length * 5 + 4;
  });
  currentY += 8;
  doc.setDrawColor(226, 232, 240); doc.line(marginX, currentY, W - marginX, currentY); currentY += 8;
  doc.setFont('times', 'italic'); doc.setFontSize(14); doc.setTextColor(15, 23, 42);
  doc.text('Priyanshu Kumar', marginX, currentY); currentY += 5;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('Founder, Invigo Infotech', marginX, currentY);
  drawQRCode(doc, W - marginX - 20, currentY - 15, 18, enrollment.candidateId);
  currentY = H - 15;
  doc.setDrawColor(226, 232, 240); doc.line(marginX, currentY, W - marginX, currentY);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(148, 163, 184);
  doc.text('This acceptance letter is electronically generated by Invigo Infotech.', W / 2, currentY + 4, { align: 'center' });
  doc.text(`Verification: https://www.invigoinfotech.in/verification | Ref: ${enrollment.candidateId}`, W / 2, currentY + 8, { align: 'center' });
  doc.setFillColor(16, 185, 129); doc.rect(0, H - 3, W, 3, 'F');
  doc.save(`Acceptance_Letter_InvigoInfotech_${enrollment.fullName.replace(/\s+/g, '_')}.pdf`);
}