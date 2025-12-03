import jsPDF from "jspdf";

interface ShareCertificateData {
  acknowledgementNumber: string;
  fullName: string;
  index2ApplicantNames?: string[];
  flatNumber: string;
  wing: string;
  email: string;
  mobileNumber: string;
  carpetArea?: string;
  builtUpArea?: string;
  membershipType: string;
  digitalSignature: string;
  submittedDate: string;
}

const SOCIETY_INFO = {
  name: "Citron Phase 2 C & D Co-operative Housing Society Limited",
  registrationNo: "PNA/PNA (5)/HSG / (TC)/28263/Year 2025-26/Date 17.06.2025",
  phone: "+91 9673639643 | +91 9960337893",
  email: "office@citronsociety.in",
  address:
    "G No. 878 (Part) (New), Kesnand Road, Wagholi, Tal. Haveli Pune 412207",
};

export const generateShareCertificateReceipt = (
  data: ShareCertificateData
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Helper function to add centered text
  const addCenteredText = (
    text: string,
    y: number,
    fontSize: number = 12,
    fontStyle: "normal" | "bold" = "normal"
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Border removed for cleaner look

  // Society Header
  doc.setDrawColor(0, 102, 204);
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(15, 15, pageWidth - 30, 55, 3, 3, "FD");

  addCenteredText(SOCIETY_INFO.name, yPosition + 5, 14, "bold");
  yPosition += 10;
  addCenteredText(
    "Registration No: " + SOCIETY_INFO.registrationNo,
    yPosition,
    9
  );
  yPosition += 8;
  addCenteredText("Phone: " + SOCIETY_INFO.phone, yPosition, 9);
  yPosition += 6;
  addCenteredText("Email: " + SOCIETY_INFO.email, yPosition, 9);
  yPosition += 8;

  doc.setFontSize(8);
  const addressLines = doc.splitTextToSize(
    "Address: " + SOCIETY_INFO.address,
    pageWidth - 40
  );
  addressLines.forEach((line: string) => {
    addCenteredText(line, yPosition, 8);
    yPosition += 5;
  });

  yPosition += 10;

  // Title
  doc.setDrawColor(0, 102, 204);
  doc.setFillColor(0, 102, 204);
  doc.roundedRect(15, yPosition, pageWidth - 30, 12, 2, 2, "FD");
  doc.setTextColor(255, 255, 255);
  addCenteredText(
    "SHARE CERTIFICATE APPLICATION RECEIPT",
    yPosition + 8,
    14,
    "bold"
  );
  doc.setTextColor(0, 0, 0);

  yPosition += 20;

  // Acknowledgement Number Box
  doc.setDrawColor(0, 153, 76);
  doc.setFillColor(232, 245, 233);
  doc.roundedRect(15, yPosition, pageWidth - 30, 20, 2, 2, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  addCenteredText("Acknowledgement Number:", yPosition + 7);

  doc.setFontSize(16);
  doc.setTextColor(0, 102, 0);
  doc.setFont("helvetica", "bold");
  addCenteredText(data.acknowledgementNumber, yPosition + 15);
  doc.setTextColor(0, 0, 0);

  yPosition += 26;

  // Application Details Header
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPosition, pageWidth - 30, 8, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Application Details", 20, yPosition + 6);

  yPosition += 14;

  // Two-column layout for details
  const leftCol = 20;
  const leftValCol = 58;
  const rightCol = 110;
  const rightValCol = 152;
  const lineHeight = 8;

  doc.setFontSize(10);

  // Left Column
  doc.setFont("helvetica", "bold");
  doc.text("Applicant Name:", leftCol, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(data.fullName, leftValCol, yPosition);

  yPosition += lineHeight;

  // Add Index-2 Applicant Names if available
  if (data.index2ApplicantNames && data.index2ApplicantNames.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Index-2 Applicants:", leftCol, yPosition);
    doc.setFont("helvetica", "normal");

    // Display all applicant names with proper spacing
    data.index2ApplicantNames.forEach((name, index) => {
      if (index === 0) {
        doc.text(`${index + 1}. ${name}`, leftValCol, yPosition);
      } else {
        yPosition += lineHeight;
        doc.text(`${index + 1}. ${name}`, leftValCol, yPosition);
      }
    });
    yPosition += lineHeight;
  }

  doc.setFont("helvetica", "bold");
  doc.text("Flat Number:", leftCol, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(data.flatNumber, leftValCol, yPosition);

  yPosition += lineHeight;
  doc.setFont("helvetica", "bold");
  doc.text("Wing:", leftCol, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(data.wing, leftValCol, yPosition);

  yPosition += lineHeight;
  doc.setFont("helvetica", "bold");
  doc.text("Membership Type:", leftCol, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(data.membershipType, leftValCol, yPosition);

  // Right Column
  yPosition -= lineHeight * 3; // Reset to top of left column

  doc.setFont("helvetica", "bold");
  doc.text("Email:", rightCol, yPosition);
  doc.setFont("helvetica", "normal");
  const emailText =
    data.email.length > 25 ? data.email.substring(0, 22) + "..." : data.email;
  doc.text(emailText, rightValCol, yPosition);

  yPosition += lineHeight;
  doc.setFont("helvetica", "bold");
  doc.text("Mobile Number:", rightCol, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(data.mobileNumber, rightValCol, yPosition);

  yPosition += lineHeight;
  if (data.carpetArea) {
    doc.setFont("helvetica", "bold");
    doc.text("Carpet Area:", rightCol, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(data.carpetArea + " sq.ft", rightValCol, yPosition);
    yPosition += lineHeight;
  }

  if (data.builtUpArea) {
    doc.setFont("helvetica", "bold");
    doc.text("Built-up Area:", rightCol, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(data.builtUpArea + " sq.ft", rightValCol, yPosition);
    yPosition += lineHeight;
  }

  yPosition += lineHeight;

  // Submission Details
  yPosition += 6;
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPosition, pageWidth - 30, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Submission Details", 20, yPosition + 6);

  yPosition += 14;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Submitted On:", leftCol, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(data.submittedDate, leftValCol, yPosition);

  yPosition += lineHeight;
  doc.setFont("helvetica", "bold");
  doc.text("Digital Signature:", leftCol, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(data.digitalSignature, leftValCol, yPosition);

  yPosition += 16;

  // Documents Submitted
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPosition, pageWidth - 30, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Documents Submitted", 20, yPosition + 6);

  yPosition += 14;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("\u2022 Index II Document", leftCol, yPosition);
  yPosition += lineHeight;
  doc.text("\u2022 Possession Letter", leftCol, yPosition);
  yPosition += lineHeight;
  doc.text("\u2022 Aadhaar Card", leftCol, yPosition);

  yPosition += 12;

  // Important Notes
  doc.setDrawColor(255, 152, 0);
  doc.setFillColor(255, 248, 225);
  doc.roundedRect(15, yPosition, pageWidth - 30, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Important Notes:", 20, yPosition + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "\u2022 Please save this receipt for your records.",
    20,
    yPosition + 13
  );
  doc.text(
    "\u2022 A confirmation email has been sent to your registered email address.",
    20,
    yPosition + 18
  );
  doc.text(
    "\u2022 Use the acknowledgement number to track your application status.",
    20,
    yPosition + 23
  );

  yPosition += 30;

  // Footer - positioned relative to content
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPosition, pageWidth - 15, yPosition);

  yPosition += 6;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "italic");
  addCenteredText(
    "This is a computer-generated receipt and does not require a physical signature.",
    yPosition
  );
  yPosition += 5;
  addCenteredText(
    "For any queries, please contact us at " + SOCIETY_INFO.email,
    yPosition
  );

  // Save the PDF
  doc.save(`Share_Certificate_Receipt_${data.acknowledgementNumber}.pdf`);
};
