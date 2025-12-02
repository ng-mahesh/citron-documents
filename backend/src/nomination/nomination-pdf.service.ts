import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Nomination } from './schemas/nomination.schema';

@Injectable()
export class NominationPdfService {
  private readonly pageWidth = 595.28; // A4 width in points
  private readonly pageHeight = 841.89; // A4 height in points
  private readonly margin = 40;
  private readonly contentWidth = this.pageWidth - 2 * this.margin;

  /**
   * Generate PDF for a nomination form
   */
  async generatePdf(nomination: Nomination): Promise<Buffer> {
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
        yPos = this.addTitleBox(doc, yPos, nomination);

        // Primary Member Details
        yPos = this.addMemberDetailsSection(doc, yPos, nomination);

        // Nominees Section
        yPos = this.addNomineesSection(doc, yPos, nomination);

        // Witnesses Section
        yPos = this.addWitnessesSection(doc, yPos, nomination);

        // Declaration Section
        yPos = this.addDeclarationSection(doc, yPos, nomination);

        // Enclosures Section
        yPos = this.addEnclosuresSection(doc, yPos, nomination);

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

    // Contact details - Mobile and Email on same line
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

    return y;
  }

  /**
   * Add title box
   */
  private addTitleBox(doc: PDFKit.PDFDocument, startY: number, nomination: Nomination): number {
    let y = startY;

    // Right column - Two boxes side by side
    const boxWidth = 90;
    const rightColStart = this.pageWidth - this.margin - boxWidth * 2 - 10;

    // Acknowledgement Number (first box)
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#000000')
      .text('Acknowledgement No:', rightColStart, y);
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(nomination.acknowledgementNumber, rightColStart, y + 9);

    // Registration No. (second box, next to acknowledgement)
    const regNoX = rightColStart + boxWidth + 10;
    doc.fontSize(7).font('Helvetica').fillColor('#000000').text('Registration No:', regNoX, y);
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('', regNoX, y + 9);

    y += 25;

    // Date (below both boxes, aligned right)
    doc.fontSize(7).font('Helvetica').text('Date: __/__/____', rightColStart, y);

    y += 25; // Space after date for manual writing

    // Form title (centered, full width)
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('NOMINATION FORM', this.margin, y, {
        width: this.contentWidth,
        align: 'center',
      });

    return y + 25;
  }

  /**
   * Add member details section
   */
  private addMemberDetailsSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    nomination: Nomination,
  ): number {
    let y = startY;
    const boxHeight = 30;
    const colWidth = this.contentWidth / 3;

    // Section header
    doc.rect(this.margin, y, this.contentWidth, 20).fill('#f0f0f0').stroke();
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('PRIMARY MEMBER DETAILS', this.margin + 5, y + 6, {
        width: this.contentWidth - 10,
      });
    y += 20;

    // Row 1: Name, Flat Number, Wing
    this.drawBox(doc, this.margin, y, colWidth, boxHeight, 'Name', nomination.primaryMemberName);
    this.drawBox(
      doc,
      this.margin + colWidth,
      y,
      colWidth,
      boxHeight,
      'Flat Number',
      nomination.flatNumber,
    );
    this.drawBox(doc, this.margin + 2 * colWidth, y, colWidth, boxHeight, 'Wing', nomination.wing);
    y += boxHeight;

    // Row 2: Email, Mobile
    this.drawBox(
      doc,
      this.margin,
      y,
      colWidth * 2,
      boxHeight,
      'Email Address',
      nomination.primaryMemberEmail,
    );
    this.drawBox(
      doc,
      this.margin + 2 * colWidth,
      y,
      colWidth,
      boxHeight,
      'Mobile Number',
      nomination.primaryMemberMobile,
    );
    y += boxHeight;

    // Joint Member (if exists)
    if (nomination.jointMemberName) {
      y += 5;
      doc.rect(this.margin, y, this.contentWidth, 20).fill('#f0f0f0').stroke();
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('JOINT MEMBER DETAILS', this.margin + 5, y + 6);
      y += 20;

      this.drawBox(doc, this.margin, y, colWidth, boxHeight, 'Name', nomination.jointMemberName);
      this.drawBox(
        doc,
        this.margin + colWidth,
        y,
        colWidth,
        boxHeight,
        'Email Address',
        nomination.jointMemberEmail || '',
      );
      this.drawBox(
        doc,
        this.margin + 2 * colWidth,
        y,
        colWidth,
        boxHeight,
        'Mobile Number',
        nomination.jointMemberMobile || '',
      );
      y += boxHeight;
    }

    return y + 5;
  }

  /**
   * Add nominees section
   */
  private addNomineesSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    nomination: Nomination,
  ): number {
    let y = startY;
    const boxHeight = 30;
    const colWidth = this.contentWidth / 3;

    // Section header
    doc.rect(this.margin, y, this.contentWidth, 20).fill('#f0f0f0').stroke();
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('NOMINEE DETAILS', this.margin + 5, y + 6);
    y += 20;

    nomination.nominees.forEach((nominee, index) => {
      // Check if we need a new page
      if (y > this.pageHeight - 200) {
        doc.addPage();
        y = this.margin;
      }

      // Nominee number
      doc.rect(this.margin, y, this.contentWidth, 18).fill('#e8e8e8').stroke();
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(`Nominee ${index + 1}`, this.margin + 5, y + 5);
      y += 18;

      // Row 1: Name, Relationship, Date of Birth
      this.drawBox(doc, this.margin, y, colWidth, boxHeight, 'Name', nominee.name);
      this.drawBox(
        doc,
        this.margin + colWidth,
        y,
        colWidth,
        boxHeight,
        'Relationship',
        nominee.relationship,
      );
      this.drawBox(
        doc,
        this.margin + 2 * colWidth,
        y,
        colWidth,
        boxHeight,
        'Date of Birth',
        this.formatDate(nominee.dateOfBirth),
      );
      y += boxHeight;

      // Row 2: Aadhaar, Share %, Address
      this.drawBox(
        doc,
        this.margin,
        y,
        colWidth,
        boxHeight,
        'Aadhaar Number',
        this.formatAadhaar(nominee.aadhaarNumber),
      );
      this.drawBox(
        doc,
        this.margin + colWidth,
        y,
        colWidth / 2,
        boxHeight,
        'Share %',
        `${nominee.sharePercentage}%`,
      );
      this.drawBox(
        doc,
        this.margin + colWidth + colWidth / 2,
        y,
        colWidth * 1.5,
        boxHeight,
        'Address',
        nominee.address || '',
      );
      y += boxHeight + 5;
    });

    return y + 5;
  }

  /**
   * Add witnesses section
   */
  private addWitnessesSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    nomination: Nomination,
  ): number {
    let y = startY;
    const boxHeight = 30;
    const colWidth = this.contentWidth / 2;

    // Check if we need a new page
    if (y > this.pageHeight - 180) {
      doc.addPage();
      y = this.margin;
    }

    // Section header
    doc.rect(this.margin, y, this.contentWidth, 20).fill('#f0f0f0').stroke();
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('WITNESSES', this.margin + 5, y + 6);
    y += 20;

    nomination.witnesses.forEach((witness, index) => {
      // Witness number
      doc.rect(this.margin, y, this.contentWidth, 18).fill('#e8e8e8').stroke();
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(`Witness ${index + 1}`, this.margin + 5, y + 5);
      y += 18;

      // Row: Name, Signature
      this.drawBox(doc, this.margin, y, colWidth, boxHeight, 'Name', witness.name);
      this.drawBox(
        doc,
        this.margin + colWidth,
        y,
        colWidth,
        boxHeight,
        'Signature',
        '', // Empty signature box
      );
      y += boxHeight;

      // Address (full width)
      this.drawBox(doc, this.margin, y, this.contentWidth, boxHeight, 'Address', witness.address);
      y += boxHeight + 5;
    });

    return y + 5;
  }

  /**
   * Add declaration section
   */
  private addDeclarationSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    nomination: Nomination,
  ): number {
    let y = startY;

    // Check if we need a new page
    if (y > this.pageHeight - 150) {
      doc.addPage();
      y = this.margin;
    }

    // Section header
    doc.rect(this.margin, y, this.contentWidth, 20).fill('#f0f0f0').stroke();
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('DECLARATION', this.margin + 5, y + 6);
    y += 20;

    // Declaration text box
    const declarationHeight = 50;
    doc.rect(this.margin, y, this.contentWidth, declarationHeight).stroke();
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#000000')
      .text(
        'I hereby declare that all the information provided above is true and correct to the best of my knowledge, and the nominees listed have the right to inherit my share certificate. I understand that any false information may result in rejection of my nomination.',
        this.margin + 5,
        y + 5,
        {
          width: this.contentWidth - 10,
          align: 'justify',
        },
      );
    y += declarationHeight;

    // Signature and Date
    const colWidth = this.contentWidth / 2;
    const boxHeight = 30;
    this.drawBox(
      doc,
      this.margin,
      y,
      colWidth,
      boxHeight,
      'Member Signature',
      '', // Empty signature box
    );
    this.drawBox(
      doc,
      this.margin + colWidth,
      y,
      colWidth,
      boxHeight,
      'Date',
      '', // Empty date box
    );

    return y + boxHeight;
  }

  /**
   * Add enclosures section
   */
  private addEnclosuresSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    nomination: Nomination,
  ): number {
    let y = startY + 10;

    // Check if we need a new page
    if (y > this.pageHeight - 150) {
      doc.addPage();
      y = this.margin;
    }

    // Section header
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Encl.:', this.margin, y);
    y += 15;

    // Build list of documents
    const documents: string[] = [];

    // Required documents
    documents.push('1. Index II Document');
    documents.push('2. Possession Letter');
    documents.push('3. Primary Member Aadhaar Card');

    // Optional joint member
    if (nomination.jointMemberAadhaar) {
      documents.push('4. Joint Member Aadhaar Card');
    }

    // Nominee Aadhaar cards
    nomination.nominees.forEach((nominee, index) => {
      const docNum = documents.length + 1;
      documents.push(`${docNum}. Nominee ${index + 1} Aadhaar Card (${nominee.name})`);
    });

    // Display documents list
    doc.fontSize(9).font('Helvetica').fillColor('#000000');

    documents.forEach((docText) => {
      doc.text(docText, this.margin + 10, y);
      y += 12;
    });

    return y + 10;
  }

  /**
   * Add footer
   */
  private addFooter(doc: PDFKit.PDFDocument): void {
    const footerY = this.pageHeight - this.margin - 20;
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#000000')
      .text(
        'This is a system-generated document. For queries, contact: office@citronsociety.in',
        this.margin,
        footerY,
        {
          width: this.contentWidth,
          align: 'center',
        },
      );
  }

  /**
   * Format date to DD/MM/YYYY
   */
  private formatDate(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Format Aadhaar number to XXXX-XXXX-XXXX
   */
  private formatAadhaar(aadhaar: string): string {
    if (!aadhaar || aadhaar.length !== 12) return aadhaar;
    return `${aadhaar.slice(0, 4)}-${aadhaar.slice(4, 8)}-${aadhaar.slice(8, 12)}`;
  }
}
