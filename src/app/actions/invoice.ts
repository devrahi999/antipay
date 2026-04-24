
'use server';

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Generates a professional PDF invoice for a payment session.
 * Uses a strict coordinate-based layout for pixel-perfect alignment.
 * @param data The session data (plain object)
 * @param store The merchant store details (plain object)
 * @returns A base64 encoded string of the PDF buffer.
 */
export async function generateInvoiceAction(data: any, store: any): Promise<string> {
  try {
    if (!data || !store) {
      throw new Error('Invoice data or store information is missing.');
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size: 595.28 x 841.89 pts
    const { width, height } = page.getSize();
    
    // Embed Standard Fonts
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Design Constants
    const MARGIN = 40;
    const PRIMARY_GREEN = rgb(0.086, 0.639, 0.29); // #16a34a
    const TEXT_BLACK = rgb(0.066, 0.094, 0.15);   // #111827
    const TEXT_GRAY = rgb(0.42, 0.447, 0.5);      // #6b7280
    const BORDER_COLOR = rgb(0.898, 0.91, 0.92);  // #e5e7eb
    const BG_LIGHT = rgb(0.976, 0.98, 0.984);     // #f9fafb

    let currentY = height - MARGIN;

    // Helper to sanitize strings for WinAnsi encoding (removes non-encodable characters like ৳)
    const safeText = (text: string | undefined | null) => {
      if (!text) return "—";
      return String(text).replace(/[৳]/g, 'Tk.').replace(/[^\x00-\x7F]/g, '');
    };

    // --- 1. HEADER SECTION ---
    let logoEmbedded = false;
    const logoSize = 36;

    // Resilient Logo Logic
    if (store.logoUrl && typeof store.logoUrl === 'string' && store.logoUrl.startsWith('http')) {
      try {
        const logoResponse = await fetch(store.logoUrl, { next: { revalidate: 3600 } });
        if (logoResponse.ok) {
          const arrayBuffer = await logoResponse.arrayBuffer();
          const uint8Logo = new Uint8Array(arrayBuffer);
          
          if (uint8Logo.length > 0) {
            let logoImage;
            try {
              // Try PNG first, fallback to JPG
              if (store.logoUrl.toLowerCase().endsWith('.png')) {
                logoImage = await pdfDoc.embedPng(uint8Logo);
              } else {
                logoImage = await pdfDoc.embedJpg(uint8Logo);
              }
            } catch (embedErr) {
              // If extension-based guess fails, try both
              try {
                logoImage = await pdfDoc.embedPng(uint8Logo);
              } catch {
                try {
                  logoImage = await pdfDoc.embedJpg(uint8Logo);
                } catch {
                  console.warn('Logo format not supported by pdf-lib (only standard PNG/JPG)');
                }
              }
            }

            if (logoImage) {
              page.drawImage(logoImage, {
                x: MARGIN,
                y: currentY - logoSize,
                width: logoSize,
                height: logoSize,
              });
              logoEmbedded = true;
            }
          }
        }
      } catch (e) {
        console.warn('Silent fail: Logo fetch/embed failed', e);
      }
    }

    // Store Name
    page.drawText(safeText(store.name || "AntiPay Merchant"), {
      x: logoEmbedded ? MARGIN + logoSize + 12 : MARGIN,
      y: currentY - 22,
      size: 16,
      font: fontBold,
      color: TEXT_BLACK,
    });

    // RIGHT: Invoice Header
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

    // Header Divider
    page.drawLine({
      start: { x: MARGIN, y: currentY },
      end: { x: width - MARGIN, y: currentY },
      thickness: 1,
      color: BORDER_COLOR,
    });

    currentY -= 40;

    // --- 2. AMOUNT CARD SECTION ---
    const cardHeight = 100;
    page.drawRectangle({
      x: MARGIN,
      y: currentY - cardHeight,
      width: width - (MARGIN * 2),
      height: cardHeight,
      color: BG_LIGHT,
    });

    page.drawText("Total Settled Amount", {
      x: MARGIN + 25,
      y: currentY - 30,
      size: 11,
      font: fontRegular,
      color: TEXT_GRAY,
    });

    const amountNum = typeof data.amount === 'number' ? data.amount : Number(data.amount) || 0;
    // CRITICAL FIX: Use "Tk." instead of the Unicode symbol "৳" which standard PDF fonts don't support
    const amountText = `Tk. ${amountNum.toFixed(2)}`; 
    page.drawText(amountText, {
      x: MARGIN + 25,
      y: currentY - 70,
      size: 32,
      font: fontBold,
      color: PRIMARY_GREEN,
    });

    // Verified Pill Badge
    const isVerified = data.status === 'verified';
    if (isVerified) {
      const pillWidth = 80;
      const pillHeight = 24;
      page.drawRectangle({
        x: width - MARGIN - pillWidth - 25,
        y: currentY - 60,
        width: pillWidth,
        height: pillHeight,
        color: PRIMARY_GREEN,
      });
      
      const labelText = "VERIFIED";
      const labelWidth = fontBold.widthOfTextAtSize(labelText, 9);
      page.drawText(labelText, {
        x: width - MARGIN - pillWidth - 25 + (pillWidth / 2) - (labelWidth / 2),
        y: currentY - 60 + 8,
        size: 9,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
    }

    currentY -= (cardHeight + 50);

    // --- 3. DETAILS GRID ---
    const drawRow = (label: string, value: string, y: number) => {
      page.drawText(safeText(label), { x: MARGIN + 10, y, size: 11, font: fontRegular, color: TEXT_GRAY });
      const safeValue = safeText(value);
      page.drawText(safeValue, { x: width / 2, y, size: 12, font: fontBold, color: TEXT_BLACK });
      
      page.drawLine({
        start: { x: MARGIN + 10, y: y - 12 },
        end: { x: width - MARGIN - 10, y: y - 12 },
        thickness: 0.5,
        color: BORDER_COLOR,
      });
    };

    const rows = [
      { label: "Transaction ID", value: data.trxId },
      { label: "Payment Method", value: (String(data.method || "—")).toUpperCase() },
      { label: "Order Reference", value: data.val_id },
      { label: "Sender Number", value: data.sender },
      { label: "Date Created", value: data.createdAtFormatted },
      { label: "Date Verified", value: data.verifiedAtFormatted },
    ];

    rows.forEach((row, i) => {
      drawRow(row.label, row.value, currentY - (i * 35));
    });

    // --- 4. VERIFICATION WATERMARK ---
    if (isVerified) {
      const stampX = width - 120;
      const stampY = 220;
      page.drawEllipse({
        x: stampX,
        y: stampY,
        xScale: 45,
        yScale: 45,
        borderWidth: 1.5,
        borderColor: PRIMARY_GREEN,
        opacity: 0.15,
      });
      const stampText = "VERIFIED";
      const sWidth = fontBold.widthOfTextAtSize(stampText, 10);
      page.drawText(stampText, {
        x: stampX - (sWidth / 2),
        y: stampY - 4,
        size: 10,
        font: fontBold,
        color: PRIMARY_GREEN,
        opacity: 0.2,
      });
    }

    // --- 5. FOOTER ---
    const footerY = 60;
    const footerNote = "This receipt was automatically generated and verified by AntiPay Infrastructure.";
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
    console.error('CRITICAL PDF ERROR:', err);
    // Return detailed error for better debugging in the UI
    throw new Error(`PDF Generation failed: ${err.message || 'Internal processing error'}`);
  }
}
