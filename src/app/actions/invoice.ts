
'use server';

import PDFDocument from 'pdfkit';

/**
 * Generates a professional PDF invoice for a payment session.
 * @param data The session data (amount, trxId, status, etc)
 * @param store The merchant store details (name, logo)
 * @returns A base64 encoded string of the PDF buffer.
 */
export async function generateInvoiceAction(data: any, store: any): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result.toString('base64'));
      });
      doc.on('error', (err) => reject(err));

      // --- Design & Layout ---
      const primaryColor = "#16a34a"; // AntiPay Green
      const secondaryColor = "#6b7280"; // Muted Gray
      const darkColor = "#111827"; // Dark text

      // Top Accent Bar
      doc.rect(0, 0, doc.page.width, 8).fill(primaryColor);

      // Header: Store Identity
      doc.fillColor(primaryColor)
         .fontSize(22)
         .text(store.name || "Merchant Invoice", 50, 45, { bold: true });

      doc.fillColor(darkColor)
         .fontSize(24)
         .text("RECEIPT", 400, 45, { align: 'right' });

      doc.moveTo(50, 95).lineTo(545, 95).strokeColor("#e5e7eb").lineWidth(0.5).stroke();

      // Amount Section (Hero)
      doc.fillColor(secondaryColor).fontSize(10).text("Total Settled Amount", 50, 120);
      doc.fillColor(primaryColor).fontSize(42).text(`BDT ${data.amount}.00`, 50, 140, { bold: true });

      // Status Indicator
      const statusColor = data.status === 'verified' ? '#16a34a' : (data.status === 'pending' ? '#f59e0b' : '#ef4444');
      doc.rect(445, 130, 100, 24).fill(statusColor);
      doc.fillColor("#ffffff").fontSize(10).text(data.status.toUpperCase(), 445, 138, { width: 100, align: 'center' });

      // Information Grid
      doc.rect(50, 220, 495, 260).fill("#f9fafb");
      
      const drawRow = (label: string, value: string, y: number) => {
        doc.fillColor(secondaryColor).fontSize(10).text(label, 75, y);
        doc.fillColor(darkColor).fontSize(10).text(value || "—", 240, y, { bold: true });
      };

      drawRow("Transaction ID", data.trxId, 250);
      drawRow("Payment Method", data.method?.toUpperCase(), 280);
      drawRow("Order Reference", data.val_id, 310);
      drawRow("Sender Number", data.sender, 340);
      drawRow("Merchant ID", data.userId, 370);
      drawRow("Created At", data.createdAtFormatted || "—", 400);
      drawRow("Verified At", data.verifiedAtFormatted || "—", 430);

      // Visual Confirmation (If verified)
      if (data.status === 'verified') {
         doc.circle(480, 340, 30).lineWidth(2).strokeColor(primaryColor).stroke();
         doc.moveTo(470, 340).lineTo(478, 348).lineTo(495, 332).stroke();
         doc.fillColor(primaryColor).fontSize(8).text("VERIFIED", 440, 380, { width: 80, align: 'center' });
      }

      // Legal & Footer
      doc.moveTo(50, 750).lineTo(545, 750).strokeColor("#e5e7eb").stroke();
      doc.fontSize(9)
         .fillColor(secondaryColor)
         .text("This receipt was automatically generated and verified by the AntiPay Infrastructure. No manual signature is required for validity.", 50, 765, { align: 'center', width: 495 });
      
      doc.fillColor(primaryColor).fontSize(10).text("Powered by AntiPay Ltd.", 50, 790, { align: 'center', bold: true });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
