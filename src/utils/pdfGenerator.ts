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

async function getBase64ImageFromUrl(path: string): Promise<string | null> {
  const base = import.meta.env.BASE_URL || '/';
  const url = `${base}${path.startsWith('/') ? path.slice(1) : path}`;
  
  if (imageCache[url]) return imageCache[url];
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('Failed to load image: response not ok', url);
      return null;
    }
    const contentType = res.headers.get('content-type');
    if (contentType && !contentType.startsWith('image/')) {
      console.warn('URL did not return an image', url, contentType);
      return null;
    }
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

// ─── Build Document function ───
async function buildDocument(
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
    grade?: string;
    certNo: string;
    docType: 'Certificate' | 'OfferLetter' | 'AcceptanceLetter';
  }
) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const isLandscape = W > H;
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
  const s = isLandscape ? 1 : 0.6; // scale factor for portrait ribbons
  fillQuad([[0, 0], [35 * s, 0], [0, 35 * s]], green);
  drawRotatedRect(doc, 25 * s, 25 * s, 100 * s, 5 * s, 135, yellow);
  drawRotatedRect(doc, 50 * s, 15 * s, 60 * s, 14 * s, 135, red);
  drawRotatedRect(doc, 15 * s, 60 * s, 80 * s, 25 * s, 135, blue);

  // Bottom-Right corner ribbons (angle 135)
  fillQuad([[W, H], [W - 35 * s, H], [W, H - 35 * s]], yellow);
  drawRotatedRect(doc, W - 25 * s, H - 25 * s, 100 * s, 5 * s, 135, green);
  drawRotatedRect(doc, W - 50 * s, H - 15 * s, 60 * s, 14 * s, 135, red);
  drawRotatedRect(doc, W - 15 * s, H - 60 * s, 80 * s, 25 * s, 135, blue);

  // Top URL
  if (opts.docType === 'Certificate') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text(`Certificate Verification: https://www.invigoinfotech.in/verification    INVIGO EDUCARE PVT. LTD`, W / 2, 8, { align: 'center' });
  }

  // ─── Fetch and draw images (Bigger sizes) ───
  const logoY = 24;
  const startX = isLandscape ? 45 : 25;
  const gap = isLandscape ? 50 : 38;

  const msmeImg = await getBase64ImageFromUrl('/msme_logo.png');
  if (msmeImg) doc.addImage(msmeImg, 'PNG', startX, logoY - 4, isLandscape ? 40 : 32, isLandscape ? 20 : 16);

  const mcaImg = await getBase64ImageFromUrl('/MInistory_of_corporate_affairs.jpeg');
  if (mcaImg) doc.addImage(mcaImg, 'JPEG', startX + gap, logoY - 7, isLandscape ? 26 : 22, isLandscape ? 26 : 22);

  const isoImg = await getBase64ImageFromUrl('/ISO_Logo.png');
  if (isoImg) doc.addImage(isoImg, 'PNG', startX + gap * 2 - (isLandscape ? 0 : 2), logoY - 5, isLandscape ? 24 : 20, isLandscape ? 24 : 20);

  const dpiitImg = await getBase64ImageFromUrl('/DPIIT_startup_india.png');
  if (dpiitImg) doc.addImage(dpiitImg, 'PNG', startX + gap * 3 - (isLandscape ? 0 : 5), logoY - 2, isLandscape ? 45 : 35, isLandscape ? 16 : 12);

  const invigoLogoImg = await getBase64ImageFromUrl('/logo.jpg');
  if (invigoLogoImg) doc.addImage(invigoLogoImg, 'JPEG', startX + gap * 4 - (isLandscape ? 0 : 2), logoY - 5, isLandscape ? 22 : 18, isLandscape ? 22 : 18);

  // ─── Title ───
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  const titleText = opts.docType === 'Certificate' ? 'Certificate of Completion' : 
                    opts.docType === 'OfferLetter' ? 'Internship Offer Letter' : 
                    'Internship Acceptance Letter';
  doc.text(titleText, W / 2, isLandscape ? 65 : 75, { align: 'center' });

  // ─── Auto-Wrapping Body Text ───
  const FS = 13;
  const LS = 11; 
  let y = isLandscape ? 85 : 95;
  const maxW = isLandscape ? 210 : 150;

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
      const words = seg.text.split(/( )/);

      for (const word of words) {
        if (!word) continue;
        doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
        const w = doc.getTextWidth(word);
        
        if (word !== ' ' && currentLineW + w > maxW && lines[lines.length - 1].length > 0) {
          lines.push([]);
          currentLineW = 0;
        }

        const curLine = lines[lines.length - 1];
        if (curLine.length > 0 && curLine[curLine.length - 1].bold === seg.bold) {
          curLine[curLine.length - 1].text += word;
          curLine[curLine.length - 1].w += w;
        } else {
          if (word === ' ' && currentLineW === 0) continue;
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

  let bodyParagraph: Array<{ text: string, bold: boolean }> = [];

  if (opts.docType === 'Certificate') {
    bodyParagraph = [
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
      { text: opts.grade || 'Good', bold: true },
      { text: ' in the Assessment test. ', bold: false },
      { text: 'We wish them all the best for future endeavors.', bold: false }
    ];
  } else if (opts.docType === 'OfferLetter') {
    bodyParagraph = [
      { text: 'On behalf of ', bold: false },
      { text: 'Invigo Infotech', bold: true },
      { text: ', we are pleased to offer you the position of Intern in the ', bold: false },
      { text: `"${opts.domainTitle}" `, bold: true },
      { text: 'domain. This is to confirm that ', bold: false },
      { text: opts.studentName, bold: true },
      { text: ', Reg no- ', bold: false },
      { text: opts.registrationNo, bold: true },
      { text: ' of ', bold: false },
      { text: opts.collegeName, bold: true },
      { text: ' is scheduled to begin a ', bold: false },
      { text: `${opts.durationWeeks} Weeks ${modeText} Training `, bold: true },
      { text: 'program starting from ', bold: false },
      { text: startFmt, bold: true },
      { text: '. Throughout this program, you will complete progressive milestones under the guidance of our experienced mentors. The program includes structured project modules, progress assessments, and hands-on exercises. Upon successful completion of all milestones and passing the assessment test (minimum 60% score), you will receive a verified Certificate of Completion. We look forward to having you as part of our learning community.', bold: false }
    ];
  } else if (opts.docType === 'AcceptanceLetter') {
    bodyParagraph = [
      { text: 'We are pleased to confirm that the application for ', bold: false },
      { text: opts.studentName, bold: true },
      { text: ', Reg no- ', bold: false },
      { text: opts.registrationNo, bold: true },
      { text: ' of ', bold: false },
      { text: opts.collegeName, bold: true },
      { text: ' for the ', bold: false },
      { text: `"${opts.domainTitle}" `, bold: true },
      { text: 'internship program at ', bold: false },
      { text: 'Invigo Infotech ', bold: true },
      { text: 'has been reviewed and accepted. Your ', bold: false },
      { text: `${opts.durationWeeks} Weeks ${modeText} Training `, bold: true },
      { text: 'program is scheduled to begin on ', bold: false },
      { text: startFmt, bold: true },
      { text: '. As an accepted intern, you are expected to complete all assigned weekly milestones, maintain regular communication, submit all deliverables before the deadline, and pass the final MCQ assessment with a minimum score of 60%. We look forward to supporting your growth and success.', bold: false }
    ];
  }

  y = wrapAndCenterText(bodyParagraph, y, LS, maxW);

  // ─── Footer ───
  y += 20;

  if (opts.docType === 'Certificate') {
    const issuedFmt = endFmt;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    
    doc.text('Issued on ' + issuedFmt, CX, y - 18, { align: 'center' });

    const sealImg = await getBase64ImageFromUrl('/Congrat_batch.png');
    if (sealImg) {
      doc.addImage(sealImg, 'PNG', CX + 45, y - 29, 18, 18);
    }
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

  if (opts.docType === 'Certificate') {
    // Purnea Stamp perfectly centered
    const stampImg = await getBase64ImageFromUrl('/Stamp.png');
    if (stampImg) {
      doc.addImage(stampImg, 'PNG', CX - 18, bottomY - 22, 36, 36);
    }

    // QR Code
    const qrX = W - 105;
    const qrImg = await getBase64ImageFromUrl('/Certificate_Verification_qr.jpeg');
    if (qrImg) {
      doc.addImage(qrImg, 'JPEG', qrX, bottomY - 20, 24, 24);
    } else {
      drawQRCode(doc, qrX, bottomY - 20, 24, opts.certNo);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Certificate no: ' + opts.certNo, qrX + 12, bottomY + 10, { align: 'center' });
  } else {
    // Offer / Acceptance letter footer without stamp/QR
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Reference ID: ' + opts.certNo, W - 60, bottomY + 8, { align: 'center' });
  }
}

// ═══════════════════════════════════════════════
// MANUAL CERTIFICATE GENERATOR
// ═══════════════════════════════════════════════
export async function generateManualCertificatePDF(data: ManualCertData): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const year2 = new Date(data.issuedDate).getFullYear().toString().slice(-2);
  const certNo = `${year2}IN${data.registrationNo}`;
  
  await buildDocument(doc, {
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
    docType: 'Certificate'
  });

  doc.save(`Certificate_${data.studentName.replace(/\s+/g, '_')}.pdf`);
}

// ═══════════════════════════════════════════════
// ENROLLMENT-BASED CERTIFICATE
// ═══════════════════════════════════════════════
export async function downloadCertificatePDF(cert: EnrollmentState, domainTitle: string, returnBytes: boolean = false): Promise<Uint8Array | void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const regNo = cert.registrationNo || cert.candidateId;
  const issuedDate = cert.certificateDate
    ? (() => {
      const d = new Date(cert.certificateDate);
      return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
    })()
    : new Date().toISOString().split('T')[0];

  const year2 = new Date(issuedDate).getFullYear().toString().slice(-2);
  const certNo = cert.candidateId;
  const scoreText = cert.testScore && cert.testScore >= 80 ? 'Excellent' : cert.testScore && cert.testScore >= 60 ? 'Good' : 'Good';

  await buildDocument(doc, {
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
    docType: 'Certificate'
  });

  if (returnBytes) {
    return new Uint8Array(doc.output('arraybuffer'));
  }
  doc.save(`Certificate_InvigoInfotech_${cert.fullName.replace(/\s+/g, '_')}.pdf`);
}

// ═══════════════════════════════════════════════
// OFFER LETTER PDF
// ═══════════════════════════════════════════════
export async function downloadOfferLetterPDF(offer: EnrollmentState, domainTitle: string): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const regNo = offer.registrationNo || offer.candidateId;
  const issuedDate = offer.enrollmentDate
    ? (() => {
      const d = new Date(offer.enrollmentDate);
      return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
    })()
    : new Date().toISOString().split('T')[0];

  await buildDocument(doc, {
    studentName: offer.fullName,
    registrationNo: regNo,
    collegeName: offer.collegeName,
    domainTitle,
    durationWeeks: offer.durationWeeks,
    trainingMode: offer.trainingMode || 'offline',
    startDate: offer.startDate,
    issuedDate,
    certNo: offer.candidateId,
    docType: 'OfferLetter'
  });

  doc.save(`Offer_Letter_InvigoInfotech_${offer.fullName.replace(/\s+/g, '_')}.pdf`);
}

// ═══════════════════════════════════════════════
// ACCEPTANCE LETTER PDF
// ═══════════════════════════════════════════════
export async function downloadAcceptanceLetterPDF(enrollment: EnrollmentState, domainTitle: string): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const regNo = enrollment.registrationNo || enrollment.candidateId;
  const issuedDate = enrollment.enrollmentDate
    ? (() => {
      const d = new Date(enrollment.enrollmentDate);
      return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
    })()
    : new Date().toISOString().split('T')[0];

  await buildDocument(doc, {
    studentName: enrollment.fullName,
    registrationNo: regNo,
    collegeName: enrollment.collegeName,
    domainTitle,
    durationWeeks: enrollment.durationWeeks,
    trainingMode: enrollment.trainingMode || 'offline',
    startDate: enrollment.startDate,
    issuedDate,
    certNo: enrollment.candidateId,
    docType: 'AcceptanceLetter'
  });

  doc.save(`Acceptance_Letter_InvigoInfotech_${enrollment.fullName.replace(/\s+/g, '_')}.pdf`);
}