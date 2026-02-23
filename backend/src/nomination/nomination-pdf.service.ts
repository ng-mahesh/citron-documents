import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import puppeteer from 'puppeteer';
import { Nomination } from './schemas/nomination.schema';

@Injectable()
export class NominationPdfService {
  private readonly pageWidth = 595.28;
  private readonly pageHeight = 841.89;
  private readonly margin = 40;
  private readonly contentWidth = this.pageWidth - 2 * this.margin;

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC: Acknowledgement Receipt (PDFKit) – sent to resident after submission
  // ─────────────────────────────────────────────────────────────────────────────
  async generatePdf(nomination: Nomination): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: this.margin, bottom: this.margin, left: this.margin, right: this.margin },
        });
        const chunks: Buffer[] = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        let yPos = this.margin;

        yPos = this.addHeader(doc, yPos);
        yPos = this.addTitleBox(doc, yPos, nomination);
        yPos = this.addMemberDetailsSection(doc, yPos, nomination);
        yPos = this.addNomineesSection(doc, yPos, nomination);
        yPos = this.addWitnessesSection(doc, yPos, nomination);
        yPos = this.addDeclarationSection(doc, yPos, nomination);
        this.addEnclosuresSection(doc, yPos, nomination);
        this.addFooter(doc);

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument, startY: number): number {
    let y = startY;

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('Citron Phase 2 C & D Co-operative Housing Society Limited', this.margin, y, {
        width: this.contentWidth,
        align: 'center',
      });
    y += 15;

    doc
      .fontSize(7)
      .font('Helvetica')
      .text(
        'Reg. No: PNA/PNA (5)/HSG / (TC)/28263/Year 2025-26  |  Date: 17.06.2025',
        this.margin,
        y,
        { width: this.contentWidth, align: 'center' },
      );
    y += 10;

    doc
      .fontSize(7)
      .text(
        'G No. 878 (Part) (New), Kesnand Road, Wagholi, Tal. Haveli Pune 412207',
        this.margin,
        y,
        { width: this.contentWidth, align: 'center' },
      );
    y += 10;

    doc
      .fontSize(7)
      .text('+91 9673639643 | +91 9960337893 | office@citronsociety.in', this.margin, y, {
        width: this.contentWidth,
        align: 'center',
      });
    y += 10;

    doc
      .moveTo(this.margin, y)
      .lineTo(this.pageWidth - this.margin, y)
      .stroke();
    y += 10;

    return y;
  }

  private addTitleBox(doc: PDFKit.PDFDocument, startY: number, nomination: Nomination): number {
    let y = startY;

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('NOMINATION FORM SUBMISSION', this.margin, y, {
        width: this.contentWidth,
        align: 'center',
      });
    y += 15;

    const boxHeight = 28;
    doc.rect(this.margin, y, this.contentWidth, boxHeight).fillAndStroke('#f3f4f6', '#000000');

    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#000000')
      .text('Acknowledgement Number', this.margin + 5, y + 5);
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(nomination.acknowledgementNumber, this.margin + 5, y + 15);

    const dateStr = nomination.createdAt
      ? new Date(nomination.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-IN');
    const timeStr = nomination.createdAt
      ? new Date(nomination.createdAt).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
    doc
      .fontSize(7)
      .font('Helvetica')
      .text(`Submitted on: ${dateStr} at ${timeStr}`, this.pageWidth - this.margin - 160, y + 15);

    y += boxHeight + 10;
    return y;
  }

  private addMemberDetailsSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    nomination: Nomination,
  ): number {
    let y = startY;

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('PRIMARY MEMBER DETAILS', this.margin, y);
    y += 12;

    const boxHeight = 30;
    const col3 = this.contentWidth / 3;

    this.drawBox(doc, this.margin, y, col3, boxHeight, 'Name', nomination.primaryMemberName);
    this.drawBox(
      doc,
      this.margin + col3,
      y,
      col3,
      boxHeight,
      'Flat No.',
      `${nomination.flatNumber} - Wing ${nomination.wing}`,
    );
    this.drawBox(
      doc,
      this.margin + col3 * 2,
      y,
      col3,
      boxHeight,
      'Mobile',
      nomination.primaryMemberMobile,
    );
    y += boxHeight;

    this.drawBox(
      doc,
      this.margin,
      y,
      this.contentWidth,
      boxHeight,
      'Email',
      nomination.primaryMemberEmail,
    );
    y += boxHeight + 10;

    return y;
  }

  private addNomineesSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    nomination: Nomination,
  ): number {
    let y = startY;

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000').text('NOMINEES', this.margin, y);
    y += 12;

    // Table header row
    const colW = [
      25,
      this.contentWidth * 0.28,
      this.contentWidth * 0.2,
      this.contentWidth * 0.14,
      this.contentWidth * 0.2,
    ];
    const headers = ['Sr.', 'Name', 'Relationship', 'Share %', 'Date of Birth'];
    const headerH = 18;

    doc.rect(this.margin, y, this.contentWidth, headerH).stroke();
    let hx = this.margin;
    headers.forEach((h, i) => {
      doc
        .fontSize(7)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(h, hx + 3, y + 5, { width: colW[i] - 6 });
      hx += colW[i];
    });
    y += headerH;

    nomination.nominees.forEach((nominee, idx) => {
      const rowH = 22;
      doc.rect(this.margin, y, this.contentWidth, rowH).stroke();
      let nx = this.margin;
      const vals = [
        String(idx + 1),
        nominee.name,
        nominee.relationship,
        `${nominee.sharePercentage}%`,
        this.formatDate(nominee.dateOfBirth),
      ];
      vals.forEach((v, i) => {
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#000000')
          .text(v, nx + 3, y + 7, { width: colW[i] - 6 });
        nx += colW[i];
      });
      y += rowH;
    });

    y += 10;
    return y;
  }

  private addWitnessesSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    nomination: Nomination,
  ): number {
    let y = startY;
    if (!nomination.witnesses?.length) return y;

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000').text('WITNESSES', this.margin, y);
    y += 12;

    const boxHeight = 30;
    const col1 = this.contentWidth * 0.5;
    const col2 = this.contentWidth * 0.5;

    nomination.witnesses.forEach((w, i) => {
      this.drawBox(doc, this.margin, y, col1, boxHeight, `Witness ${i + 1} Name`, w.name);
      this.drawBox(doc, this.margin + col1, y, col2, boxHeight, 'Address', w.address);
      y += boxHeight;
    });

    y += 10;
    return y;
  }

  private addDeclarationSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    nomination: Nomination,
  ): number {
    let y = startY;

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000').text('DECLARATION', this.margin, y);
    y += 12;

    doc
      .fontSize(7)
      .font('Helvetica')
      .text(
        'I hereby declare that all the information provided above is true and correct to the best of my knowledge, and the nominees listed have the right to inherit my share certificate. I understand that any false information may result in rejection of my nomination.',
        this.margin,
        y,
        { width: this.contentWidth, align: 'justify' },
      );
    y += 25;

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
      .text(nomination.memberSignature || '', this.margin + 5, y + 18, { width: sigBoxWidth - 10 });

    y += sigBoxHeight + 10;
    return y;
  }

  private addEnclosuresSection(
    doc: PDFKit.PDFDocument,
    startY: number,
    nomination: Nomination,
  ): number {
    let y = startY;

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('ENCLOSURES / DOCUMENTS SUBMITTED', this.margin, y);
    y += 12;

    const enclosures: Array<{ name: string; submitted: boolean }> = [
      { name: 'Index II Document', submitted: !!nomination.index2Document },
      { name: 'Possession Letter', submitted: !!nomination.possessionLetterDocument },
      { name: 'Primary Member Aadhaar Card', submitted: !!(nomination as any).aadhaarCardDocument },
    ];

    if (nomination.jointMemberAadhaar) {
      enclosures.push({ name: 'Joint Member Aadhaar Card', submitted: true });
    }

    nomination.nominees.forEach((n, i) => {
      enclosures.push({
        name: `Nominee ${i + 1} Aadhaar Card (${n.name})`,
        submitted: !!nomination.nomineeAadhaars?.[i],
      });
    });

    doc.fontSize(8).font('Helvetica');
    enclosures.forEach((enc, i) => {
      const status = enc.submitted ? '✓' : '✗';
      const statusColor = enc.submitted ? '#22c55e' : '#ef4444';

      doc
        .fillColor('#000000')
        .text(`${i + 1}. ${enc.name}`, this.margin + 15, y, { continued: true });
      doc.fillColor(statusColor).text(`  [${status}]`, { continued: false });
      y += 12;
    });

    y += 8;

    // Important note box
    const noteText =
      'IMPORTANT: This is a digital acknowledgement only. Please submit the original nomination form (Form No. 14 in triplicate) along with all original documents to the Society office for processing.';
    const noteLines = Math.ceil(noteText.length / 90);
    const noteH = noteLines * 9 + 10;
    doc.rect(this.margin, y, this.contentWidth, noteH).stroke('#000000');
    doc
      .fontSize(7)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(noteText, this.margin + 5, y + 5, { width: this.contentWidth - 10, align: 'justify' });
    y += noteH + 10;

    return y;
  }

  private addFooter(doc: PDFKit.PDFDocument): void {
    const footerY = this.pageHeight - this.margin - 25;

    doc
      .moveTo(this.margin, footerY)
      .lineTo(this.pageWidth - this.margin, footerY)
      .stroke();

    doc
      .fontSize(6)
      .font('Helvetica')
      .fillColor('#666666')
      .text(
        'For queries, contact: +91 9673639643 | +91 9960337893 | office@citronsociety.in',
        this.margin,
        footerY + 5,
        { width: this.contentWidth, align: 'center' },
      );
    doc.text(
      'This is a computer-generated document and does not require a physical signature.',
      this.margin,
      footerY + 12,
      { width: this.contentWidth, align: 'center' },
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC: Official Form No. 14 in Triplicate (Puppeteer) – admin print only
  // ─────────────────────────────────────────────────────────────────────────────
  async generateOfficialFormPdf(nomination: Nomination): Promise<Buffer> {
    const html = this.buildOfficialFormHtml(nomination);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        width: '8.5in',
        height: '14in',
        printBackground: true,
        margin: { top: '0.4in', bottom: '0.4in', left: '0.4in', right: '0.4in' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: Build HTML for 6-page Form No. 14
  // ─────────────────────────────────────────────────────────────────────────────
  private buildOfficialFormHtml(nomination: Nomination): string {
    const copies = [
      {
        front: this.buildFrontPage(nomination, "For Society's<br>Record"),
        back: this.buildBackPage(nomination, 'Society Record'),
      },
      {
        front: this.buildFrontPage(nomination, "For Society's<br>Record"),
        back: this.buildBackPage(nomination, 'DUPLICATE'),
      },
      {
        front: this.buildFrontPage(nomination, "For Society's<br>Record"),
        back: this.buildBackPage(nomination, 'TRIPLICATE'),
      },
    ];

    const pages = copies
      .flatMap((copy, i) => {
        const isLastPage = i === copies.length - 1;
        return [
          copy.front,
          isLastPage ? copy.back.replace('break-after: page', 'break-after: auto') : copy.back,
        ];
      })
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Arial, sans-serif;
    font-size: 14.5px;
    line-height: 1.8;
    margin: 0;
    padding: 0;
    color: #111;
  }
  .page {
    break-after: page;
    padding: 0;
  }
  /* ── Front page ── */
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
  }
  .header-left { font-weight: bold; font-size: 18px; width: 20%; }
  .header-center { text-align: center; width: 60%; line-height: 1.3; }
  .header-center h1 { margin: 0; font-size: 16px; font-weight: bold; }
  .header-center h2 { margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px; }
  .header-center p { margin: 2px 0; font-size: 13px; font-weight: bold; }
  .header-right { text-align: right; width: 20%; }
  .header-right .form-no { font-weight: bold; font-size: 18px; margin-bottom: 5px; }
  .record-box {
    border: 1.5px solid black;
    padding: 6px;
    text-align: center;
    font-weight: normal;
    font-size: 14px;
    line-height: 1.2;
  }
  .address-section { margin-bottom: 15px; line-height: 1.6; }
  .line {
    display: inline-block;
    border-bottom: 1px solid black;
    height: 1em;
    margin: 0 4px;
    vertical-align: bottom;
  }
  .filled {
    font-weight: bold;
    border-bottom: 1.5px solid black;
    padding: 0 2px;
  }
  .paragraph { text-align: left; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 15px; margin-top: 5px; }
  th, td {
    border: 1.5px solid black;
    padding: 5px;
    text-align: center;
    font-size: 13.5px;
    vertical-align: middle;
  }
  th { font-weight: normal; padding: 6px 4px; line-height: 1.2; }
  .num-row td { border-bottom: 1.5px solid black; padding: 4px; }
  .data-row td {
    height: 35px;
    vertical-align: top;
    padding-top: 8px;
    text-align: left;
    padding-left: 10px;
  }
  .footnotes-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 5px;
    font-size: 13.5px;
  }
  .footnotes p { margin: 2px 0; }
  .pto { font-weight: bold; font-size: 15px; }
  /* ── Back page ── */
  .back-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 40px;
  }
  .flex-line-container {
    display: flex;
    align-items: flex-end;
    margin-bottom: 15px;
  }
  .flex-line { flex-grow: 1; border-bottom: 1px solid black; margin: 0 10px; }
  .witness-section { margin-bottom: 30px; }
  .witness-block { margin-bottom: 25px; }
  .witness-address { margin-left: 35px; margin-top: 10px; }
  .divider { border: 0; border-top: 1px solid black; margin: 20px 0; }
  .committee-section { margin-top: 25px; line-height: 2; }
  .indent { display: inline-block; width: 40px; }
  .footer-divider { border-top: 1.5px solid black; margin-top: 5px; margin-bottom: 3px; }
</style>
</head>
<body>
${pages}
</body>
</html>`;
  }

  private buildFrontPage(nomination: Nomination, recordBoxLabel: string): string {
    const nomineeRows = this.buildNomineeTableRows(nomination);
    const firstNomineeName = nomination.nominees[0]?.name || '';
    const ackNo = nomination.acknowledgementNumber;

    return `<div class="page" style="break-after: page;">
  <div class="header-row">
    <div class="header-left">No. <span class="filled">${this.esc(ackNo)}</span></div>
    <div class="header-center">
      <h1>ORIGINAL</h1>
      <h2>FORM OF NOMINATION</h2>
      <p>[Under the Bye-law No. 32]</p>
      <p>TO BE FURNISHED IN TRIPLICATE</p>
      <p>( APPLICABLE FOR SINGLE / MORE NOMINEES THAN ONE<br>AND MINOR NOMINEE/S )</p>
    </div>
    <div class="header-right">
      <div class="form-no">Form No.14</div>
      <div class="record-box">${recordBoxLabel}</div>
    </div>
  </div>

  <div class="address-section">
    To,<br>
    The Chairman/Secretary,<br>
    Citron Phase - II, C and D wing, Co-operative Housing Society Ltd.<br>
    Kesnand Road, Wagholi<br>
  </div>

  <div class="paragraph">
    Sir,<br>
    1.&nbsp;&nbsp;&nbsp;I, Shri / Shrimati <span class="filled">${this.esc(nomination.primaryMemberName)}</span> am
    the member of the Citron Phase - II, C and D wing, Co-operative Housing Society Ltd., having
    address at G No. 878 (Part) (New), Kesnand Road, Wagholi, Tal. Haveli Pune 412207
  </div>

  <div class="paragraph">
    2.&nbsp;&nbsp;&nbsp;I hold the Share Certificate No. <span class="line" style="width: 180px;"></span>
    dated <span class="line" style="width: 120px;"></span>, Fully paid up <u>*Five / Ten</u> shares
    of Rupees Fifty each, bearing numbers from <span class="line" style="width: 100px;"></span>
    to <span class="line" style="width: 100px;"></span> (both inclusive), issued by the said society to me.
  </div>

  <div class="paragraph">
    3.&nbsp;&nbsp;&nbsp;I also hold the Flat/Tenement No. <span class="filled">${this.esc(nomination.wing)}-${this.esc(nomination.flatNumber)}</span>
    admeasuring <span class="line" style="width: 100px;"></span> Sq. Mtr./Ft.
    in the building of the said society, numbered known as <span class="line" style="width: 190px;"></span>
  </div>

  <div class="paragraph" style="margin-bottom: 5px; text-align: justify;">
    4.&nbsp;&nbsp;&nbsp;As provided under Rules 25 of the Maharashtra Co-op. Societies Rules 1961, I hereby nominate
    the person/s whose particulars are as given below.
  </div>

  <table>
    <tr>
      <th style="width: 6%;">Sr.<br>No.</th>
      <th style="width: 20%;">Name/s of the<br>Nominees</th>
      <th style="width: 22%;">Permanent<br>Addresses of the<br>Nominee/s</th>
      <th style="width: 17%;">Relationship<br>with the<br>Nominator</th>
      <th style="width: 15%;">Share of each<br>Nominee<br>(Percentage)</th>
      <th style="width: 20%;">Date of Birth<br>of the Nominee/s<br>if the Nominee/s<br>is/are a minor</th>
    </tr>
    <tr class="num-row">
      <td style="text-align:center;">1</td>
      <td style="text-align:center;">2</td>
      <td style="text-align:center;">3</td>
      <td style="text-align:center;">4</td>
      <td style="text-align:center;">5</td>
      <td style="text-align:center;">6</td>
    </tr>
    ${nomineeRows}
  </table>

  <div class="paragraph" style="text-align: justify;">
    5.&nbsp;&nbsp;&nbsp;As provided under Section 30 of the Maharashtra Co-op. Societies Act, 1960 and the
    Bye-laws No. 34 of the Society, I state that on my death, the Shares mentioned above and my interest
    in the flat/tenement, the details of which are given above, should be transferred
  </div>
  <div class="paragraph" style="margin-top: -5px;">
    to Shri / Shrimati <span class="filled">${this.esc(firstNomineeName)}</span><br>
    <span style="text-align: justify; display: block;">the first named nominee, on his/her complying with the provisions of the bye-laws of the society
    regarding requirements of admission to membership and on furnishing **indemnity bond, alongwith
    the application for membership, indemnifying the society against any claims made to the said
    shares and my interest in the said flat/tenement, by the other nominee/nominees.</span>
  </div>

  <div style="border-top: 1.5px solid black; margin-top: 5px; margin-bottom: 5px;"></div>

  <div class="footnotes-container">
    <div class="footnotes">
      <p>* Strike out which is not applicable.</p>
      <p>** Indemnity Bond is not required to be furnished in case of a single nominee.</p>
    </div>
    <div class="pto">[P.T.O.]</div>
  </div>
</div>`;
  }

  private buildBackPage(nomination: Nomination, copyLabel: string): string {
    const w1 = nomination.witnesses?.[0];
    const w2 = nomination.witnesses?.[1];
    const date = nomination.createdAt
      ? new Date(nomination.createdAt).toLocaleDateString('en-IN')
      : '';

    const receivedSection =
      copyLabel === 'Society Record'
        ? `<div style="text-align: center; font-weight: bold; font-size: 15px; margin-top: 40px; margin-bottom: 50px;">
    Received the duplicate copy of the Nomination.
  </div>
  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px;">
    <div>Date :</div>
    <div>Signature of the Nominator Member</div>
  </div>`
        : '<br><br>';

    return `<div class="page" style="break-after: page;">
  <div class="back-header">
    <div style="width: 33%;"></div>
    <div style="width: 33%; text-align: center;">2</div>
    <div style="width: 33%; text-align: right;">${copyLabel}</div>
  </div>

  <div class="paragraph">
    6.&nbsp;&nbsp;&nbsp;&nbsp;As the nominee/s at Sr. No. <span class="line" style="width: 250px;"></span> is the minor, I hereby appoint<br><br>
    Shri / Shrimati <span class="line" style="width: 580px;"></span><br>
    As the *guardian/legal representative of the minor to represent the minor nominee in matters
    connected with this nomination.
  </div>

  <div class="paragraph">
    Place :<br>
    <div class="flex-line-container" style="margin-top: 10px;">
      <span>Date :&nbsp;</span>
      <span class="flex-line" style="text-align: left; padding-left: 5px;"><strong>${date}</strong></span>
      <span>Signature of the Nominator Member</span>
    </div>
  </div>

  <div class="witness-section">
    Witnesses :<br><br>
    Name and Addresses of Witnesses<br><br>

    <div class="witness-block">
      <div class="flex-line-container">
        <span style="white-space: nowrap;">(1)&nbsp;&nbsp;&nbsp;Shri / Shrimati&nbsp;</span>
        <span class="flex-line" style="text-align: left; padding-left: 4px;"><strong>${this.esc(w1?.name || '')}</strong></span>
        <span style="white-space: nowrap;">(1) Signature of the Witness</span>
      </div>
      <div class="witness-address">
        <div style="display: flex; align-items: flex-end;">
          <span>Address&nbsp;</span>
          <span style="flex-grow: 1; border-bottom: 1px solid black; padding: 0 4px;">${this.esc(w1?.address || '')}</span>
        </div>
        <div style="margin-top: 12px;">
          <span class="line" style="width: 100%;"></span>
        </div>
      </div>
    </div>

    <div class="witness-block">
      <div class="flex-line-container">
        <span style="white-space: nowrap;">(2)&nbsp;&nbsp;&nbsp;Shri / Shrimati&nbsp;</span>
        <span class="flex-line" style="text-align: left; padding-left: 4px;"><strong>${this.esc(w2?.name || '')}</strong></span>
        <span style="white-space: nowrap;">(2) Signature of the Witness</span>
      </div>
      <div class="witness-address">
        <div style="display: flex; align-items: flex-end;">
          <span>Address&nbsp;</span>
          <span style="flex-grow: 1; border-bottom: 1px solid black; padding: 0 4px;">${this.esc(w2?.address || '')}</span>
        </div>
        <div style="margin-top: 12px;">
          <span class="line" style="width: 100%;"></span>
        </div>
      </div>
    </div>
  </div>

  <div class="paragraph" style="margin-bottom: 10px;">
    Place :<br><br>
    Date :
  </div>

  <hr class="divider">

  <div class="committee-section">
    <span class="indent"></span>The nomination was placed in the meeting of the Managing Committee of the Society held on
    <span class="line" style="width: 280px;"></span> for being recorded in its minutes.<br><br>
    <span class="indent"></span>The nomination has been recorded in the Nomination Register at Sr. No.
    <span class="line" style="width: 180px;"></span><br><br>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
      <div>Date : <span class="line" style="width: 150px;"></span></div>
      <div style="margin-right: 180px;">Hon. Secretary</div>
    </div>

    <div style="text-align: right; margin-top: 50px;">
      Citron Phase - II, C and D wing, Co-op. Housing Society Ltd.
    </div>
  </div>

  ${receivedSection}

  <div class="footer-divider"></div>
  <div style="font-size: 13.5px;">* Strike out which is not applicable.</div>
</div>`;
  }

  private buildNomineeTableRows(nomination: Nomination): string {
    let rows = '';
    for (let i = 0; i < 5; i++) {
      const n = nomination.nominees[i];
      const isLast = i === 4;
      const nameFontSize = n && n.name.length > 15 ? 'font-size: 10px;' : '';
      const addrFontSize = n && (n.address || '').length > 15 ? 'font-size: 10px;' : '';
      rows += `
    <tr class="data-row"${isLast ? ' style="border-bottom: 1.5px solid black;"' : ''}>
      <td>[${i + 1}]</td>
      <td style="${nameFontSize}">${n ? this.esc(n.name) : ''}</td>
      <td style="${addrFontSize}">${n ? this.esc(n.address || '') : ''}</td>
      <td>${n ? this.esc(n.relationship) : ''}</td>
      <td>${n ? n.sharePercentage + '%' : ''}</td>
      <td>${n ? this.formatDate(n.dateOfBirth) : ''}</td>
    </tr>`;
    }
    return rows;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: PDFKit helper for acknowledgement receipt
  // ─────────────────────────────────────────────────────────────────────────────
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

    doc.rect(x, y, width, height).stroke();
    doc
      .fontSize(labelSize)
      .font('Helvetica')
      .fillColor('#000000')
      .text(label, x + 3, y + 3, { width: width - 6 });
    doc
      .fontSize(valueSize)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(value, x + 3, y + 14, { width: width - 6 });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: Utilities
  // ─────────────────────────────────────────────────────────────────────────────
  private esc(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
