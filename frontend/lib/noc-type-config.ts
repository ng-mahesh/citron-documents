import { NocType } from "./types";

/**
 * Configuration interface for each NOC type (Frontend)
 */
export interface NocTypeConfig {
  value: NocType;
  label: string;
  requiresBuyerInfo: boolean;
  requiresPurposeDescription: boolean;
  nocFees: number;
  transferFees: number;
  requiredDocuments: string[];
  optionalDocuments: string[];
}

/**
 * Centralized configuration for all NOC types (Frontend)
 * Mirrors backend configuration for type-specific form behavior
 */
export const NOC_TYPE_CONFIGS: Record<NocType, NocTypeConfig> = {
  "Flat Transfer/Sale/Purchase": {
    value: "Flat Transfer/Sale/Purchase",
    label: "Flat Transfer/Sale/Purchase",
    requiresBuyerInfo: true,
    requiresPurposeDescription: false,
    nocFees: 1000, // Rs.1,000
    transferFees: 25000, // Rs.25,000
    requiredDocuments: [
      "agreementDocument",
      "maintenanceReceiptDocument",
      "buyerAadhaarDocument",
    ],
    optionalDocuments: ["shareCertificateDocument", "buyerPanDocument"],
  },
  "Bank Account Transfer": {
    value: "Bank Account Transfer",
    label: "Bank Account Transfer",
    requiresBuyerInfo: false,
    requiresPurposeDescription: false,
    nocFees: 0, // Free
    transferFees: 0,
    requiredDocuments: ["identityProofDocument", "shareCertificateDocument"],
    optionalDocuments: [],
  },
  "MSEB Electricity Bill Name Change": {
    value: "MSEB Electricity Bill Name Change",
    label: "MSEB Electricity Bill Name Change",
    requiresBuyerInfo: false,
    requiresPurposeDescription: false,
    nocFees: 0, // Free
    transferFees: 0,
    requiredDocuments: [
      "currentElectricityBillDocument",
      "identityProofDocument",
      "shareCertificateDocument",
    ],
    optionalDocuments: [],
  },
  "Other Purpose": {
    value: "Other Purpose",
    label: "Other Purpose",
    requiresBuyerInfo: false,
    requiresPurposeDescription: true,
    nocFees: 0, // Free
    transferFees: 0,
    requiredDocuments: [
      "maintenanceReceiptDocument",
      "shareCertificateDocument",
      "supportingDocuments",
      "identityProofDocument",
    ],
    optionalDocuments: [],
  },
};

/**
 * NOC Type options for dropdown/select components
 */
export const NOC_TYPE_OPTIONS = Object.values(NOC_TYPE_CONFIGS).map(
  (config) => ({
    value: config.value,
    label: config.label,
  })
);

/**
 * Get document label for display purposes
 */
export const getDocumentLabel = (docField: string): string => {
  const labels: Record<string, string> = {
    agreementDocument: "Agreement Copy / Allotment Letter",
    maintenanceReceiptDocument: "Latest Maintenance Receipt (no dues)",
    buyerAadhaarDocument: "Buyer Aadhaar Card",
    shareCertificateDocument: "Share Certificate Copy",
    buyerPanDocument: "Buyer PAN Card (optional)",
    identityProofDocument: "Identity Proof (Aadhaar)",
    currentElectricityBillDocument: "Current Electricity Bill",
    supportingDocuments: "Supporting Documents",
  };
  return labels[docField] || docField;
};
