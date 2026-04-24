
'use server';

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Generates a professional PDF invoice for a payment session using pdf-lib.
 * This avoids AFM font loading issues common with pdfkit in bundled environments.
 * @param data The session data (plain object)
 * @param store The merchant store details (plain object)
 * @returns A base64 encoded string of the PDF buffer.
 */
export async function generateInvoiceAction(data: any, store: any): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
    
    // Embed standard fonts (these don't require external .afm files)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const { width, height } = page.getSize();
    
    // Design Constants
    const primaryColor = rgb(0.086, 0.639, 0.29); // AntiPay Green (#16a34a)
    const secondaryColor = rgb(0.42, 0.447, 0.5); // Muted Gray
    const darkColor = rgb(0.066, 0.094, 0.15); // Dark text
    
    // 1. Top Accent Bar
    page.drawRectangle({
      x: 0,
      y: height - 10,
      width: width,
      height: 10,
      color: primaryColor,
    });

    // 2. Header Section
    let headerY = height - 70;
    
    // Handle Store Logo
    if (store.logoUrl && store.logoUrl.startsWith('http')) {
      try {
        const response = await fetch(store.logoUrl);
        const imageBytes = await response.arrayBuffer();
        
        let logoImage;
        if (store.logoUrl.toLowerCase().endsWith('.png')) {
          logoImage = await pdfDoc.embedPng(imageBytes);
        } else {
          logoImage = await pdfDoc.embedJpg(imageBytes);
        }
        
        const dims = logoImage.scale(0.25);
        page.drawImage(logoImage, {
          x: 50,
          y: headerY - (dims.height / 2),
          width: 40,
          height: 40,
        });
        
        page.drawText(store.name || "Merchant Receipt", {
          x: 100,
          y: headerY,
          size: 20,
          font: fontBold,
          color: primaryColor,
        });
      } catch (e) {
        // Fallback if logo fetch fails
        page.drawText(store.name || "Merchant Receipt", {
          x: 50,
          y: headerY,
          size: 20,
          font: fontBold,
          color: primaryColor,
        });
      }
    } else {
      page.drawText(store.name || "Merchant Receipt", {
        x: 50,
        y: headerY,
        size: 20,
        font: fontBold,
        color: primaryColor,
      });
    }

    page.drawText("OFFICIAL RECEIPT", {
      x: width - 200,
      y: headerY,
      size: 16,
      font: fontBold,
      color: darkColor,
    });

    // 3. Amount Hero Section
    const amountY = height - 180;
    page.drawRectangle({
      x: 50,
      y: amountY - 40,
      width: width - 100,
      height: 100,
      color: rgb(0.97, 0.98, 0.98),
      opacity: 0.5,
    });

    page.drawText("Total Settled Amount", {
      x: 75,
      y: amountY + 30,
      size: 10,
      font: fontRegular,
      color: secondaryColor,
    });

    page.drawText(`BDT ${data.amount}.00`, {
      x: 75,
      y: amountY - 10,
      size: 42,
      font: fontBold,
      color: primaryColor,
    });

    // Status Badge
    const status = (data.status || 'pending').toUpperCase();
    const statusColor = status === 'VERIFIED' ? primaryColor : rgb(0.96, 0.62, 0.04);
    
    page.drawRectangle({
      x: width - 180,
      y: amountY,
      width: 130,
      height: 30,
      color: statusColor,
      borderRadius: 15,
    });

    page.drawText(status, {
      x: width - 180 + (130 / 2) - (fontBold.widthOfTextAtSize(status, 10) / 2),
      y: amountY + 10,
      size: 10,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // 4. Details Table
    const tableStartY = amountY - 100;
    const rowHeight = 35;
    
    const drawRow = (label: string, value: string, index: number) => {
      const y = tableStartY - (index * rowHeight);
      page.drawText(label, { x: 75, y, size: 10, font: fontRegular, color: secondaryColor });
      page.drawText(value, { x: 240, y, size: 10, font: fontBold, color: darkColor });
      
      // Border line
      page.drawLine({
        start: { x: 50, y: y - 10 },
        end: { x: width - 50, y: y - 10 },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9),
      });
    };

    drawRow("Transaction ID", data.trxId || "—", 0);
    drawRow("Payment Method", (data.method || "—").toUpperCase(), 1);
    drawRow("Order Reference", data.val_id || "—", 2);
    drawRow("Sender Number", data.sender || "—", 3);
    drawRow("Date Created", data.createdAtFormatted || "—", 4);
    drawRow("Date Verified", data.verifiedAtFormatted || "—", 5);

    // 5. Verification Seal
    if (status === 'VERIFIED') {
      const sealX = width - 130;
      const sealY = tableStartY - (3 * rowHeight);
      
      page.drawCircle({
        x: sealX + 30,
        y: sealY,
        size: 35,
        borderWidth: 2,
        borderColor: primaryColor,
      });
      
      const sealText = "VERIFIED";
      page.drawText(sealText, {
        x: sealX + 30 - (fontBold.widthOfTextAtSize(sealText, 8) / 2),
        y: sealY - 30,
        size: 8,
        font: fontBold,
        color: primaryColor,
      });
    }

    // 6. Footer
    const footerY = 50;
    page.drawLine({
      start: { x: 50, y: footerY + 30 },
      end: { x: width - 50, y: footerY + 30 },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });

    const footerText = "This receipt was automatically generated and verified by the AntiPay Infrastructure.";
    page.drawText(footerText, {
      x: (width / 2) - (fontRegular.widthOfTextAtSize(footerText, 9) / 2),
      y: footerY + 10,
      size: 9,
      font: fontRegular,
      color: secondaryColor,
    });

    page.drawText("Powered by AntiPay Ltd.", {
      x: (width / 2) - (fontBold.widthOfTextAtSize("Powered by AntiPay Ltd.", 10) / 2),
      y: footerY - 10,
      size: 10,
      font: fontBold,
      color: primaryColor,
    });

    const pdfBase64 = await pdfDoc.saveAsBase64();
    return pdfBase64;
  } catch (err: any) {
    console.error('SERVER PDF GENERATION ERROR:', err);
    throw new Error('Failed to generate PDF');
  }
}
