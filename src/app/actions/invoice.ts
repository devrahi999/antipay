
'use server';

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Generates a high-end professional PDF invoice for a payment session.
 * Uses strict coordinate-based layout for pixel-perfect alignment.
 * @param data The session data (plain object)
 * @param store The merchant store details (plain object)
 * @returns A base64 encoded string of the PDF buffer.
 */
export async function generateInvoiceAction(data: any, store: any): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
    const { width, height } = page.getSize();
    
    // Fonts
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Constants
    const MARGIN = 40;
    const PRIMARY_GREEN = rgb(0.086, 0.639, 0.29); // #16a34a
    const TEXT_BLACK = rgb(0.066, 0.094, 0.15);   // #111827
    const TEXT_GRAY = rgb(0.42, 0.447, 0.5);      // #6b7280
    const BORDER_COLOR = rgb(0.898, 0.91, 0.92);  // #e5e7eb
    const BG_LIGHT = rgb(0.976, 0.98, 0.984);     // #f9fafb

    let currentY = height - MARGIN;

    // --- 1. HEADER SECTION ---
    // LEFT: Logo + Store Name
    if (store.logoUrl && store.logoUrl.startsWith('http')) {
      try {
        const response = await fetch(store.logoUrl);
        const imageBytes = await response.arrayBuffer();
        let logoImage;
        
        // Dynamic detection for images without clear extensions (like Picsum)
        const isPng = store.logoUrl.toLowerCase().endsWith('.png');
        try {
            if (isPng) {
                logoImage = await pdfDoc.embedPng(imageBytes);
            } else {
                logoImage = await pdfDoc.embedJpg(imageBytes);
            }
        } catch (embedError) {
            // If JPG fails, try PNG as fallback for extension-less URLs
            logoImage = await pdfDoc.embedPng(imageBytes);
        }
        
        if (logoImage) {
            const logoSize = 32;
            page.drawImage(logoImage, {
              x: MARGIN,
              y: currentY - logoSize,
              width: logoSize,
              height: logoSize,
            });
            
            page.drawText(store.name || "Merchant", {
              x: MARGIN + logoSize + 12,
              y: currentY - 22,
              size: 16,
              font: fontBold,
              color: TEXT_BLACK,
            });
        }
      } catch (e) {
        // Safe fallback if image fetch/embed fails
        page.drawText(store.name || "Merchant", {
          x: MARGIN,
          y: currentY - 22,
          size: 16,
          font: fontBold,
          color: TEXT_BLACK,
        });
      }
    } else {
      page.drawText(store.name || "Merchant", {
        x: MARGIN,
        y: currentY - 22,
        size: 16,
        font: fontBold,
        color: TEXT_BLACK,
      });
    }

    // RIGHT: Invoice Label
    const invoiceLabel = "INVOICE";
    const invoiceLabelWidth = fontBold.widthOfTextAtSize(invoiceLabel, 18);
    page.drawText(invoiceLabel, {
      x: width - MARGIN - invoiceLabelWidth,
      y: currentY - 18,
      size: 18,
      font: fontBold,
      color: TEXT_BLACK,
    });
    
    const subtitle = "Official Receipt";
    const subtitleWidth = fontRegular.widthOfTextAtSize(subtitle, 10);
    page.drawText(subtitle, {
      x: width - MARGIN - subtitleWidth,
      y: currentY - 32,
      size: 10,
      font: fontRegular,
      color: TEXT_GRAY,
    });

    currentY -= 60;

    // Divider
    page.drawLine({
      start: { x: MARGIN, y: currentY },
      end: { x: width - MARGIN, y: currentY },
      thickness: 1,
      color: BORDER_COLOR,
    });

    currentY -= 40;

    // --- 2. AMOUNT CARD ---
    const cardHeight = 100;
    page.drawRectangle({
      x: MARGIN,
      y: currentY - cardHeight,
      width: width - (MARGIN * 2),
      height: cardHeight,
      color: BG_LIGHT,
    });

    page.drawText("Total Amount", {
      x: MARGIN + 25,
      y: currentY - 30,
      size: 11,
      font: fontRegular,
      color: TEXT_GRAY,
    });

    const amountText = `৳ ${Number(data.amount).toFixed(2)}`;
    page.drawText(amountText, {
      x: MARGIN + 25,
      y: currentY - 70,
      size: 32,
      font: fontBold,
      color: PRIMARY_GREEN,
    });

    // Verified Pill
    const isVerified = data.status === 'verified';
    if (isVerified) {
      const pillLabel = "VERIFIED";
      const pillWidth = 80;
      const pillHeight = 24;
      page.drawRectangle({
        x: width - MARGIN - pillWidth - 25,
        y: currentY - 60,
        width: pillWidth,
        height: pillHeight,
        color: PRIMARY_GREEN,
      });
      
      const labelWidth = fontBold.widthOfTextAtSize(pillLabel, 9);
      page.drawText(pillLabel, {
        x: width - MARGIN - pillWidth - 25 + (pillWidth / 2) - (labelWidth / 2),
        y: currentY - 60 + 8,
        size: 9,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
    }

    currentY -= (cardHeight + 50);

    // --- 3. DETAILS TABLE ---
    const drawRow = (label: string, value: string, y: number) => {
      page.drawText(label, { x: MARGIN + 10, y, size: 11, font: fontRegular, color: TEXT_GRAY });
      page.drawText(String(value), { x: width / 2, y, size: 12, font: fontBold, color: TEXT_BLACK });
      
      page.drawLine({
        start: { x: MARGIN + 10, y: y - 12 },
        end: { x: width - MARGIN - 10, y: y - 12 },
        thickness: 0.5,
        color: BORDER_COLOR,
      });
    };

    const rows = [
      { label: "Transaction ID", value: data.trxId || "—" },
      { label: "Payment Method", value: (data.method || "—").toUpperCase() },
      { label: "Order Reference", value: data.val_id || "—" },
      { label: "Sender Number", value: data.sender || "—" },
      { label: "Date Created", value: data.createdAtFormatted || "—" },
      { label: "Date Verified", value: data.verifiedAtFormatted || "—" },
    ];

    rows.forEach((row, i) => {
      drawRow(row.label, row.value, currentY - (i * 35));
    });

    // --- 4. VERIFIED STAMP ---
    if (isVerified) {
      const stampX = width - 120;
      const stampY = 220;
      // Fixed: pdf-lib uses drawEllipse, not drawCircle
      page.drawEllipse({
        x: stampX,
        y: stampY,
        xScale: 45,
        yScale: 45,
        borderWidth: 1.5,
        borderColor: PRIMARY_GREEN,
        opacity: 0.3,
      });
      const stampText = "VERIFIED";
      const sWidth = fontBold.widthOfTextAtSize(stampText, 10);
      page.drawText(stampText, {
        x: stampX - (sWidth / 2),
        y: stampY - 4,
        size: 10,
        font: fontBold,
        color: PRIMARY_GREEN,
        opacity: 0.3,
      });
    }

    // --- 5. FOOTER ---
    const footerY = 60;
    const footerNote = "This receipt was automatically generated and verified by AntiPay.";
    const noteWidth = fontRegular.widthOfTextAtSize(footerNote, 9);
    page.drawText(footerNote, {
      x: (width / 2) - (noteWidth / 2),
      y: footerY,
      size: 9,
      font: fontRegular,
      color: TEXT_GRAY,
    });

    const poweredBy = "Powered by AntiPay";
    const pWidth = fontBold.widthOfTextAtSize(poweredBy, 11);
    page.drawText(poweredBy, {
      x: (width / 2) - (pWidth / 2),
      y: footerY - 18,
      size: 11,
      font: fontBold,
      color: PRIMARY_GREEN,
    });

    const pdfBase64 = await pdfDoc.saveAsBase64();
    return pdfBase64;
  } catch (err: any) {
    console.error('SERVER PDF GENERATION ERROR:', err);
    throw new Error('Failed to generate PDF');
  }
}
