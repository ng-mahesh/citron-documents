import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { NocRequest } from './schemas/noc-request.schema';

@Injectable()
export class NocRequestPdfService {
  private readonly pageWidth = 595.28; // A4 width in points
  private readonly pageHeight = 841.89; // A4 height in points
  private readonly margin = 40;
  private readonly contentWidth = this.pageWidth - 2 * this.margin;

  /**
   * Generate PDF for a NOC request form
   */
  async generatePdf(request: NocRequest): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: this.margin, bottom: this.margin, left: this.margin, right: this.margin },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        let yPos = this.margin;

        // Header Section
        yPos = this.addHeader(doc, yPos);

        // Title Box
        yPos = this.addTitleBox(doc, yPos, request);

        // Seller Details
        yPos = this.addSellerDetailsSection(doc, yPos, request);

        // Buyer Details
        yPos = this.addBuyerDetailsSection(doc, yPos, request);

        // Property & NOC Details
        yPos = this.addNocDetailsSection(doc, yPos, request);

        // Payment Details
        yPos = this.addPaymentDetailsSection(doc, yPos, request);

        // Declaration Section
        yPos = this.addDeclarationSection(doc, yPos, request);

        // Enclosures Section
        this.addEnclosuresSection(doc, yPos, request);

        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Draw a box with label and value
   */
  private drawBox(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    value: string,
    options: { labelSize?: number; valueSize?: number } = {},
  ): void {
    const labelSize = options.labelSize || 7;
    const valueSize = options.valueSize || 9;

    // Draw border
    doc.rect(x, y, width, height).stroke();

    // Draw label
    doc
      .fontSize(labelSize)
      .font('Helvetica')
      .fillColor('#000000')
      .text(label, x + 3, y + 3, { width: width - 6 });

    // Draw value
    doc
      .fontSize(valueSize)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(value, x + 3, y + 14, { width: width - 6 });
  }

  /**
   * Add header with society details
   */
  private addHeader(doc: PDFKit.PDFDocument, startY: number): number {
    let y = startY;

    // Society name
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('Citron Phase 2 C & D Co-operative Housing Society Limited', this.margin, y, {
        width: this.contentWidth,
        align: 'center',
      });
    y += 15;

    // Registration details
    doc
      .fontSize(7)
      .font('Helvetica')
      .text(
        'Registration No: PNA/PNA (5)/HSG / (TC)/28263/Year 2025-26/Date 17.06.2025',
        this.margin,
        y,
        {
          width: this.contentWidth,
          align: 'center',
        },
      );
    y += 10;

    // Contact details
    doc
      .fontSize(7)
      .text('+91 9673639643 | +91 9960337893 | office@citronsociety.in', this.margin, y, {
        width: this.contentWidth,
        align: 'center',
      });
    y += 10;

    // Address
    doc
      .fontSize(7)
      .text(
        'G No. 878 (Part) (New), Kesnand Road, Wagholi, Tal. Haveli Pune 412207',
        this.margin,
        y,
        {
          width: this.contentWidth,
          align: 'center',
        },
      );
    y += 15;

    // Draw horizontal line
    doc
      .moveTo(this.margin, y)
      .lineTo(this.pageWidth - this.margin, y)
      .stroke();
    y += 10;

    return y;
  }

  /**
   * Add title box with acknowledgement number
   */
  private addTitleBox(doc: PDFKit.PDFDocument, startY: number, request: NocRequest): number {
    let y = startY;

    // Title
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('NO OBJECTION CERTIFICATE (NOC) REQUEST', this.margin, y, {
        width: this.contentWidth,
        align: 'center',
      });
    y += 15;

    // Acknowledgement box
    const boxWidth = this.contentWidth;
    const boxHeight = 28;

    doc.rect(this.margin, y, boxWidth, boxHeight).fillAndStroke('#f3f4f6', '#000000');

    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#000000')
      .text('Acknowledgement Number', this.margin + 5, y + 5);

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(request.acknowledgementNumber, this.margin + 5, y + 15);

    const dateStr = new Date(request.createdAt).toLocaleDateString('en-IN');
    doc
      .fontSize(7)
      .font('Helvetica')
      .text(`Submitted on: ${dateStr}`, this.pageWidth - this.margin - 120, y + 15);

    y += boxHeight + 10;

    return y;
  }

  /**
   * Add seller details section
   */
  private addSellerDetailsSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    request: NocRequest,
  ): number {
    let y = startY;

    // Section header
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('SELLER / OWNER INFORMATION', this.margin, y);
    y += 12;

    const boxHeight = 30;
    const col1Width = this.contentWidth * 0.6;
    const col2Width = this.contentWidth * 0.4;

    // Row 1: Full Name | Flat & Wing
    this.drawBox(doc, this.margin, y, col1Width, boxHeight, 'Full Name', request.sellerName);
    this.drawBox(
      doc,
      this.margin + col1Width,
      y,
      col2Width,
      boxHeight,
      'Flat & Wing',
      `${request.flatNumber} - ${request.wing}`,
    );
    y += boxHeight;

    // Row 2: Email | Mobile Number
    this.drawBox(doc, this.margin, y, col1Width, boxHeight, 'Email', request.sellerEmail);
    this.drawBox(
      doc,
      this.margin + col1Width,
      y,
      col2Width,
      boxHeight,
      'Mobile Number',
      request.sellerMobileNumber,
    );
    y += boxHeight;

    if (request.sellerAlternateMobile) {
      this.drawBox(
        doc,
        this.margin,
        y,
        col1Width,
        boxHeight,
        'Alternate Mobile',
        request.sellerAlternateMobile,
      );
      y += boxHeight;
    }

    y += 10;
    return y;
  }

  /**
   * Add buyer details section
   */
  private addBuyerDetailsSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    request: NocRequest,
  ): number {
    let y = startY;

    // Section header
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('BUYER INFORMATION', this.margin, y);
    y += 12;

    const boxHeight = 30;
    const col1Width = this.contentWidth * 0.6;
    const col2Width = this.contentWidth * 0.4;

    // Row 1: Full Name | Mobile Number
    this.drawBox(doc, this.margin, y, col1Width, boxHeight, 'Buyer Name', request.buyerName);
    this.drawBox(
      doc,
      this.margin + col1Width,
      y,
      col2Width,
      boxHeight,
      'Mobile Number',
      request.buyerMobileNumber,
    );
    y += boxHeight;

    // Row 2: Email
    this.drawBox(doc, this.margin, y, this.contentWidth, boxHeight, 'Email', request.buyerEmail);
    y += boxHeight + 10;

    return y;
  }

  /**
   * Add NOC details section
   */
  private addNocDetailsSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    request: NocRequest,
  ): number {
    let y = startY;

    // Section header
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('NOC & TRANSFER DETAILS', this.margin, y);
    y += 12;

    const boxHeight = 30;
    const col1Width = this.contentWidth * 0.5;
    const col2Width = this.contentWidth * 0.5;

    // Row 1: Reason | Expected Transfer Date
    this.drawBox(doc, this.margin, y, col1Width, boxHeight, 'Reason for NOC', request.reason);
    const transferDate = new Date(request.expectedTransferDate).toLocaleDateString('en-IN');
    this.drawBox(
      doc,
      this.margin + col1Width,
      y,
      col2Width,
      boxHeight,
      'Expected Transfer Date',
      transferDate,
    );
    y += boxHeight;

    // Row 2: Status
    this.drawBox(doc, this.margin, y, col1Width, boxHeight, 'Request Status', request.status);
    this.drawBox(
      doc,
      this.margin + col1Width,
      y,
      col2Width,
      boxHeight,
      'Payment Status',
      request.paymentStatus,
    );
    y += boxHeight + 10;

    return y;
  }

  /**
   * Add payment details section
   */
  private addPaymentDetailsSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    request: NocRequest,
  ): number {
    let y = startY;

    // Section header
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('PAYMENT DETAILS', this.margin, y);
    y += 12;

    const boxHeight = 30;
    const col1Width = this.contentWidth / 3;

    // Row 1: Fees breakdown
    this.drawBox(
      doc,
      this.margin,
      y,
      col1Width,
      boxHeight,
      'NOC Fees',
      `₹${request.nocFees || 1000}`,
    );
    this.drawBox(
      doc,
      this.margin + col1Width,
      y,
      col1Width,
      boxHeight,
      'Transfer Fees',
      `₹${request.transferFees || 25000}`,
    );
    this.drawBox(
      doc,
      this.margin + col1Width * 2,
      y,
      col1Width,
      boxHeight,
      'Total Amount',
      `₹${request.totalAmount || 26000}`,
    );
    y += boxHeight;

    // Row 2: Payment info
    if (request.paymentTransactionId) {
      this.drawBox(
        doc,
        this.margin,
        y,
        col1Width * 2,
        boxHeight,
        'Transaction ID',
        request.paymentTransactionId,
      );
      const paymentDateStr = request.paymentDate
        ? new Date(request.paymentDate).toLocaleDateString('en-IN')
        : 'Pending';
      this.drawBox(
        doc,
        this.margin + col1Width * 2,
        y,
        col1Width,
        boxHeight,
        'Payment Date',
        paymentDateStr,
      );
      y += boxHeight;
    }

    y += 10;
    return y;
  }

  /**
   * Add declaration section
   */
  private addDeclarationSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    request: NocRequest,
  ): number {
    let y = startY;

    // Section header
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000').text('DECLARATION', this.margin, y);
    y += 12;

    // Declaration text
    const declarationText =
      'I hereby declare that all the information provided above is true and correct to the best of my knowledge. ' +
      'I understand that the society will verify all submitted documents and maintenance dues before processing this NOC request. ' +
      'I agree to pay all applicable fees and complete the transfer process as per society norms.';

    doc.fontSize(7).font('Helvetica').text(declarationText, this.margin, y, {
      width: this.contentWidth,
      align: 'justify',
    });
    y += 30;

    // Signature box
    const sigBoxHeight = 35;
    const sigBoxWidth = this.contentWidth * 0.4;

    doc.rect(this.margin, y, sigBoxWidth, sigBoxHeight).stroke();
    doc
      .fontSize(7)
      .font('Helvetica')
      .text('Digital Signature', this.margin + 5, y + 5);
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(request.digitalSignature, this.margin + 5, y + 18, {
        width: sigBoxWidth - 10,
      });

    y += sigBoxHeight + 10;
    return y;
  }

  /**
   * Add enclosures section
   */
  private addEnclosuresSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    request: NocRequest,
  ): number {
    let y = startY;

    // Section header
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('ENCLOSURES / DOCUMENTS SUBMITTED', this.margin, y);
    y += 12;

    const enclosures = [
      { name: 'Agreement Copy / Allotment Letter', doc: request.agreementDocument },
      {
        name: 'Share Certificate Copy (if issued)',
        doc: request.shareCertificateDocument,
        optional: true,
      },
      { name: 'Latest Maintenance Receipt (no dues)', doc: request.maintenanceReceiptDocument },
      { name: 'Buyer Aadhaar Card', doc: request.buyerAadhaarDocument },
      { name: 'Buyer PAN Card', doc: request.buyerPanDocument, optional: true },
    ];

    doc.fontSize(8).font('Helvetica');

    enclosures.forEach((enclosure, index) => {
      const status = enclosure.doc ? '✓' : enclosure.optional ? '-' : '✗';
      const statusColor = enclosure.doc ? '#22c55e' : enclosure.optional ? '#94a3b8' : '#ef4444';

      doc
        .fillColor('#000000')
        .text(`${index + 1}. ${enclosure.name}`, this.margin + 15, y, { continued: true });

      doc.fillColor(statusColor).text(`  [${status}]`, { continued: false });

      y += 12;
    });

    y += 10;
    return y;
  }

  /**
   * Add footer with contact information
   */
  private addFooter(doc: PDFKit.PDFDocument): void {
    const footerY = this.pageHeight - this.margin - 25;

    // Draw horizontal line
    doc
      .moveTo(this.margin, footerY)
      .lineTo(this.pageWidth - this.margin, footerY)
      .stroke();

    // Footer text
    doc
      .fontSize(6)
      .font('Helvetica')
      .fillColor('#666666')
      .text(
        'For queries, contact: +91 9673639643 | +91 9960337893 | office@citronsociety.in',
        this.margin,
        footerY + 5,
        {
          width: this.contentWidth,
          align: 'center',
        },
      );

    doc.text(
      'This is a computer-generated document and does not require a physical signature.',
      this.margin,
      footerY + 12,
      {
        width: this.contentWidth,
        align: 'center',
      },
    );
  }
}
