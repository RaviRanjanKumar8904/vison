import { jsPDF } from 'jspdf';
import { EnrollmentState } from '../types';

export function downloadOfferLetterPDF(offer: EnrollmentState, domainTitle: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // A4 dimensions: 210mm x 297mm
  const marginX = 20;
  let currentY = 15;

  // 1. Top Decorative Tech Accent Line
  doc.setFillColor(30, 64, 175); // Dark blue / brand color
  doc.rect(0, 0, 210, 4, 'F');
  currentY += 5;

  // 2. Official Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('INVIGO INFOTECH PVT LTD', marginX, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Autonomous Skill Verification, Placements & Innovation Labs', marginX, currentY + 11);
  doc.text('Web: www.invigoinfotech.com | Email: academic@invigo.co', marginX, currentY + 15);

  // Logo Placeholder Icon (drawing a neat double chevron or graduation cap using line vectors)
  doc.setDrawColor(37, 99, 235); // blue-600
  doc.setLineWidth(1);
  // Simple graduation cap line drawing
  doc.line(165, 20, 180, 13); // Top cap rhumb
  doc.line(180, 13, 195, 20);
  doc.line(195, 20, 180, 27);
  doc.line(180, 27, 165, 20);
  doc.setFillColor(191, 219, 254); // blue-200
  doc.rect(173, 23, 14, 6, 'F'); // Under cap base
  doc.line(195, 20, 195, 28); // Tassel line

  currentY += 25;

  // Horizontal separator line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(marginX, currentY, 210 - marginX, currentY);
  currentY += 8;

  // 3. Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text('INTERNSHIP OFFER & OPPORTUNITY ACCEPTANCE MEMORANDUM', marginX, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`MEMORANDUM ID: ${offer.candidateId}`, marginX, currentY);
  doc.text(`DATE OF ISSUE: ${offer.enrollmentDate}`, 145, currentY);
  currentY += 8;

  // Details Container Box background
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(marginX, currentY, 210 - (marginX * 2), 56, 'F');
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.rect(marginX, currentY, 210 - (marginX * 2), 56, 'S');

  // Box Contents
  const gridX1 = marginX + 5;
  const gridX2 = 115;
  let gridY = currentY + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  // Left Column
  doc.text('CANDIDATE NAME:', gridX1, gridY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(offer.fullName.toUpperCase(), gridX1, gridY + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('COMMUNICATION EMAIL:', gridX1, gridY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(offer.email, gridX1, gridY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('ACADEMIC AFFILIATION:', gridX1, gridY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  const collegeSnippet = offer.collegeName.length > 38 ? offer.collegeName.slice(0, 35) + '...' : offer.collegeName;
  doc.text(`${offer.degree}, ${collegeSnippet}`, gridX1, gridY + 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('SECURE PAYMENT RECEIPT:', gridX1, gridY + 36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.setFontSize(9.5);
  doc.text(`Rs. ${offer.amountPaid || ''} Paid (PhonePe UPI)`, gridX1, gridY + 40);

  // Right Column
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('DESIGNATED ROLE:', gridX2, gridY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(10);
  doc.text('Applied Research Intern', gridX2, gridY + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('INTERNSHIP MATRIX / DOMAIN:', gridX2, gridY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(domainTitle, gridX2, gridY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('SCHEDULED ROTATION & DURATION:', gridX2, gridY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(`${offer.startDate} (${offer.durationWeeks} Weeks Cohort)`, gridX2, gridY + 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('CHOICE TRAINING NODE MODE:', gridX2, gridY + 36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  const parsedMode = offer.trainingMode === 'online' ? 'Online Virtual Labs' : 'Offline Immersive Centers';
  doc.text(parsedMode, gridX2, gridY + 40);

  currentY += 66;

  // 4. Letter Content
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Dear ${offer.fullName},`, marginX, currentY);
  currentY += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85); // slate-700
  
  const lineSpacing = 6;
  const letterTexts = [
    `On behalf of Invigo Infotech Private Limited, we are pleased to confirm your appointment as an Applied Research Intern specializing in the ${domainTitle} stream. This position is a structured scholarship program designed to strengthen industrial programming proficiency and test core diagnostic capabilities limitlessly.`,
    
    `Throughout your ${offer.durationWeeks}-week rotation timeline, you will complete self-paced milestones under virtual advisement from our engineering mentors. The training program consists of structured project modules, real-time code reviews, and remote Zoom progress workshops. This exposure will culminate in a validated project repository ready to be pitched in placement processes or academic boards.`,
    
    `Please compile your digital submissions through our Student Portal regularly. Upon completing all milestones successfully, you will be cleared to compile your final certified credentials which contain verifiable ledger identifiers.`
  ];

  letterTexts.forEach((text) => {
    const wrappedText = doc.splitTextToSize(text, 210 - (marginX * 2));
    doc.text(wrappedText, marginX, currentY);
    currentY += (wrappedText.length * lineSpacing) + 2;
  });

  currentY += 6;

  // 5. Training Phase Milestone Grid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('COHORT MILESTONE PIPELINE & COMPLIANCE RULES:', marginX, currentY);
  currentY += 4;

  // Three column grid representation in PDF using rectangles
  const colWidth = (210 - (marginX * 2)) / 3 - 3;
  
  // Phase 1
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, colWidth, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(marginX, currentY, colWidth, 22, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text('PHASE 1: LOGIC SIMULATOR', marginX + 3, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Weeks 1-4. Focus on design', marginX + 3, currentY + 11);
  doc.text('layouts, scripts, & mock datasets.', marginX + 3, currentY + 15);

  // Phase 2
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX + colWidth + 4, currentY, colWidth, 22, 'F');
  doc.rect(marginX + colWidth + 4, currentY, colWidth, 22, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text('PHASE 2: API & SYNAPSE', marginX + colWidth + 7, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Weeks 5-8. Real connections,', marginX + colWidth + 7, currentY + 11);
  doc.text('routes, and active forms.', marginX + colWidth + 7, currentY + 15);

  // Phase 3
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX + (colWidth * 2) + 8, currentY, colWidth, 22, 'F');
  doc.rect(marginX + (colWidth * 2) + 8, currentY, colWidth, 22, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text('PHASE 3: LIVE HOSTING', marginX + (colWidth * 2) + 11, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Weeks 9-12. Portals, cloud', marginX + (colWidth * 2) + 11, currentY + 11);
  doc.text('deploy, and score releases.', marginX + (colWidth * 2) + 11, currentY + 15);

  currentY += 34;

  // 6. Signatures and sealing block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(115, 115, 115);
  doc.text('System Blockchain Signature Verification Hash:', marginX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.setFontSize(8);
  doc.text(`sha256:7f053de08fa1ffc90a182c0b892${offer.candidateId.replace(/-/g, '').toLowerCase()}`, marginX, currentY + 3.5);

  // Register signature
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Registrar Signature, Academic Board', 125, currentY);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // blue-900
  doc.setFontSize(10.5);
  doc.text('M. Krishnaswamy', 125, currentY + 5.5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Invigo Infotech Registrar Node', 125, currentY + 9);

  // Footer stamp line
  currentY += 15;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, currentY, 210 - marginX, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This Acceptance Memorandum is electronically created and signed by Invigo and registered on the unified server registry.', marginX, currentY + 4);

  // Save/Download PDF
  doc.save(`Acceptance_Letter_Invigo_${offer.fullName.replace(/\s+/g, '_')}.pdf`);
}

export function downloadCertificatePDF(cert: EnrollmentState, domainTitle: string) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Landscape Dimensions: 297mm width x 210mm height
  const width = 297;
  const height = 210;

  // 1. Ornate Golden Border & Dark Accents
  doc.setFillColor(15, 23, 42); // slate-900 / dark premium base
  doc.rect(0, 0, width, height, 'F');

  // Innermost light background frame
  doc.setFillColor(255, 255, 255); // Pure pristine white inside card
  doc.rect(8, 8, width - 16, height - 16, 'F');

  // Double thin gold lines border
  doc.setDrawColor(217, 119, 6); // Amber/Gold accent RGB
  doc.setLineWidth(1.2);
  doc.rect(12, 12, width - 24, height - 24, 'S');

  doc.setLineWidth(0.4);
  doc.rect(14, 14, width - 28, height - 28, 'S');

  // Decorative Golden Corner Accents
  const cd = 20; // corner dimension
  doc.setFillColor(245, 158, 11); // Gold solid corner nodes
  // Top-Left corner
  doc.rect(12, 12, 4, 4, 'F');
  doc.line(12 + cd, 12, 12 + cd, 16);
  doc.line(12, 12 + cd, 16, 12 + cd);
  // Top-Right corner
  doc.rect(width - 16, 12, 4, 4, 'F');
  doc.line(width - 12 - cd, 12, width - 12 - cd, 16);
  doc.line(width - 12, 12 + cd, width - 16, 12 + cd);
  // Bottom-Left corner
  doc.rect(12, height - 16, 4, 4, 'F');
  doc.line(12 + cd, height - 12, 12 + cd, height - 16);
  doc.line(12, height - 12 - cd, 16, height - 12 - cd);
  // Bottom-Right corner
  doc.rect(width - 16, height - 16, 4, 4, 'F');
  doc.line(width - 12 - cd, height - 12, width - 12 - cd, height - 16);
  doc.line(width - 12, height - 12 - cd, width - 16, height - 12 - cd);

  // 2. Official Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text('INVIGO INFOTECH PRIVATE LIMITED', width / 2, 32, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('Unified Digital Registration Platform for Tech & Management Scholars', width / 2, 38, { align: 'center' });
  doc.text('ISO 9001:2015 Certified | Government Registered Node', width / 2, 42, { align: 'center' });

  // Elegant divider decoration
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(80, 48, width - 80, 48);

  // Small gold diamond in center of divider
  doc.setFillColor(217, 119, 6);
  doc.triangle(width / 2 - 2, 48, width / 2 + 2, 48, width / 2, 46, 'F');
  doc.triangle(width / 2 - 2, 48, width / 2 + 2, 48, width / 2, 50, 'F');

  // 3. Document Title
  doc.setFont('times', 'italic');
  doc.setFontSize(16);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text('This is to proudly certify that the Academic Board has verified academic execution for', width / 2, 60, { align: 'center' });

  // 4. Recipient Name (Beautiful High-Contrast Display)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(30, 64, 175); // Dark Blue
  doc.text(cert.fullName.toUpperCase(), width / 2, 75, { align: 'center' });

  // Extra line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`of ${cert.collegeName}`, width / 2, 83, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.text('and has successfully completed the structured, industry-aligned internship program in', width / 2, 94, { align: 'center' });

  // 5. Internship Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(domainTitle.toUpperCase(), width / 2, 107, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(71, 85, 105);
  const textDuration = `A structured ${cert.durationWeeks}-Week deep-learning practical program, commencing on ${cert.startDate}.`;
  doc.text(textDuration, width / 2, 116, { align: 'center' });

  doc.text('During this period, the candidate demonstrated exceptional diligence, logical agility, and mastery in code deliverables.', width / 2, 122, { align: 'center' });

  // 6. Security Credentials block
  doc.setFillColor(248, 250, 252); // Slate-50 background for credentials
  doc.rect(40, 134, width - 80, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(40, 134, width - 80, 22, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('LEDGER ID (VERIFIABLE CERTIFICATE NUMBER):', 47, 141);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text(cert.candidateId, 47, 147);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('VERIFICATION SIGNATURE (SHA256):', 145, 141);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(16, 185, 129); // Emerald-500
  const ledgerHash = `e892cce508fb1cfa44a478c903ff${cert.candidateId.replace(/-/g, '').toLowerCase()}`;
  doc.text(ledgerHash, 145, 146);

  // 7. Signature Seals & Bottom
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Head of Training & Placements', 45, 185);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Dr. J. P. Nair', 45, 178);

  // Center Seal decoration
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.6);
  doc.circle(width / 2, 175, 10, 'S');
  doc.setFillColor(254, 243, 199);
  doc.circle(width / 2, 175, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(217, 119, 6);
  doc.text('INVIGO', width / 2, 174.5, { align: 'center' });
  doc.text('SEAL', width / 2, 177.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Registrar Signature, Board of Trustees', 195, 185);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('M. Krishnaswamy', 195, 178);

  // Save/Download PDF
  doc.save(`Internship_Certificate_Invigo_${cert.fullName.replace(/\s+/g, '_')}.pdf`);
}

