import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { ShareCertificate } from './schemas/share-certificate.schema';

@Injectable()
export class ShareCertificatePdfService {
  private readonly pageWidth = 595.28; // A4 width in points
  private readonly pageHeight = 841.89; // A4 height in points
  private readonly margin = 40;
  private readonly contentWidth = this.pageWidth - 2 * this.margin;

  /**
   * Generate PDF for a share certificate form
   */
  async generatePdf(certificate: ShareCertificate): Promise<Buffer> {
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
        yPos = this.addTitleBox(doc, yPos, certificate);

        // Member Details
        yPos = this.addMemberDetailsSection(doc, yPos, certificate);

        // Property Details
        yPos = this.addPropertyDetailsSection(doc, yPos, certificate);

        // Co-applicant Names (if exists)
        if (certificate.index2ApplicantNames && certificate.index2ApplicantNames.length > 0) {
          yPos = this.addCoApplicantsSection(doc, yPos, certificate);
        }

        // Joint Member (if exists)
        if (certificate.jointMemberName) {
          yPos = this.addJointMemberSection(doc, yPos, certificate);
        }

        // Declaration Section
        yPos = this.addDeclarationSection(doc, yPos, certificate);

        // Enclosures Section
        yPos = this.addEnclosuresSection(doc, yPos, certificate);

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
  private addTitleBox(
    doc: PDFKit.PDFDocument,
    startY: number,
    certificate: ShareCertificate,
  ): number {
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
      .text(certificate.acknowledgementNumber, rightColStart, y + 9);

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
      .text('SHARE CERTIFICATE APPLICATION FORM', this.margin, y, {
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
    certificate: ShareCertificate,
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
      .text('MEMBER DETAILS', this.margin + 5, y + 6);
    y += 20;

    // Row 1: Full Name, Flat Number, Wing
    this.drawBox(doc, this.margin, y, colWidth, boxHeight, 'Full Name', certificate.fullName);
    this.drawBox(
      doc,
      this.margin + colWidth,
      y,
      colWidth,
      boxHeight,
      'Flat Number',
      certificate.flatNumber,
    );
    this.drawBox(doc, this.margin + 2 * colWidth, y, colWidth, boxHeight, 'Wing', certificate.wing);
    y += boxHeight;

    // Row 2: Email, Mobile, Alternate Mobile
    this.drawBox(doc, this.margin, y, colWidth, boxHeight, 'Email Address', certificate.email);
    this.drawBox(
      doc,
      this.margin + colWidth,
      y,
      colWidth,
      boxHeight,
      'Mobile Number',
      certificate.mobileNumber,
    );
    this.drawBox(
      doc,
      this.margin + 2 * colWidth,
      y,
      colWidth,
      boxHeight,
      'Alternate Mobile',
      certificate.alternateMobileNumber || '',
    );
    y += boxHeight;

    // Row 3: Membership Type
    this.drawBox(
      doc,
      this.margin,
      y,
      colWidth,
      boxHeight,
      'Membership Type',
      certificate.membershipType,
    );
    y += boxHeight;

    return y + 5;
  }

  /**
   * Add property details section
   */
  private addPropertyDetailsSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    certificate: ShareCertificate,
  ): number {
    let y = startY;
    const boxHeight = 30;
    const colWidth = this.contentWidth / 2;

    // Section header
    doc.rect(this.margin, y, this.contentWidth, 20).fill('#f0f0f0').stroke();
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('PROPERTY DETAILS', this.margin + 5, y + 6);
    y += 20;

    // Row: Carpet Area, Built-up Area
    this.drawBox(
      doc,
      this.margin,
      y,
      colWidth,
      boxHeight,
      'Carpet Area (sq. ft.)',
      certificate.carpetArea ? certificate.carpetArea.toString() : '',
    );
    this.drawBox(
      doc,
      this.margin + colWidth,
      y,
      colWidth,
      boxHeight,
      'Built-up Area (sq. ft.)',
      certificate.builtUpArea ? certificate.builtUpArea.toString() : '',
    );
    y += boxHeight;

    return y + 5;
  }

  /**
   * Add co-applicants section
   */
  private addCoApplicantsSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    certificate: ShareCertificate,
  ): number {
    let y = startY;
    const boxHeight = 30;

    // Section header
    doc.rect(this.margin, y, this.contentWidth, 20).fill('#f0f0f0').stroke();
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('CO-APPLICANT NAMES (AS PER INDEX-II)', this.margin + 5, y + 6);
    y += 20;

    // Display each co-applicant name
    certificate.index2ApplicantNames.forEach((name, index) => {
      this.drawBox(
        doc,
        this.margin,
        y,
        this.contentWidth,
        boxHeight,
        `Co-Applicant ${index + 1}`,
        name,
      );
      y += boxHeight;
    });

    return y + 5;
  }

  /**
   * Add joint member section
   */
  private addJointMemberSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    certificate: ShareCertificate,
  ): number {
    let y = startY;
    const boxHeight = 30;
    const colWidth = this.contentWidth / 3;

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
      .text('JOINT MEMBER DETAILS', this.margin + 5, y + 6);
    y += 20;

    // Row: Name, Email, Mobile
    this.drawBox(doc, this.margin, y, colWidth, boxHeight, 'Name', certificate.jointMemberName);
    this.drawBox(
      doc,
      this.margin + colWidth,
      y,
      colWidth,
      boxHeight,
      'Email Address',
      certificate.jointMemberEmail || '',
    );
    this.drawBox(
      doc,
      this.margin + 2 * colWidth,
      y,
      colWidth,
      boxHeight,
      'Mobile Number',
      certificate.jointMemberMobile || '',
    );
    y += boxHeight;

    return y + 5;
  }

  /**
   * Add declaration section
   */
  private addDeclarationSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    certificate: ShareCertificate,
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
        'I hereby declare that all the information provided above is true and correct to the best of my knowledge. I understand that any false information may result in rejection of my application.',
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

    return y + boxHeight + 10;
  }

  /**
   * Add enclosures section
   */
  private addEnclosuresSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    certificate: ShareCertificate,
  ): number {
    let y = startY;

    // Check if we need a new page
    if (y > this.pageHeight - 120) {
      doc.addPage();
      y = this.margin;
    }

    // Section header
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Encl.:', this.margin, y);
    y += 15;

    // Build list of documents
    const documents: string[] = [];
    documents.push('1. Index II Document');
    documents.push('2. Possession Letter');
    documents.push('3. Aadhaar Card');

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
}
