import { NocType } from '../schemas/noc-request.schema';

/**
 * Configuration interface for each NOC type
 */
export interface NocTypeConfig {
  requiresBuyerInfo: boolean;
  requiresPurposeDescription: boolean;
  nocFees: number;
  transferFees: number;
  requiredDocuments: string[];
  optionalDocuments: string[];
}

/**
 * Centralized configuration for all NOC types
 * Defines fees, required fields, and document requirements for each type
 */
export const NOC_TYPE_CONFIGS: Record<NocType, NocTypeConfig> = {
  [NocType.FLAT_TRANSFER]: {
    requiresBuyerInfo: true,
    requiresPurposeDescription: false,
    nocFees: 1000, // Rs.1,000
    transferFees: 25000, // Rs.25,000
    requiredDocuments: ['agreementDocument', 'maintenanceReceiptDocument', 'buyerAadhaarDocument'],
    optionalDocuments: ['shareCertificateDocument', 'buyerPanDocument'],
  },
  [NocType.BANK_ACCOUNT_TRANSFER]: {
    requiresBuyerInfo: false,
    requiresPurposeDescription: false,
    nocFees: 0, // Free
    transferFees: 0,
    requiredDocuments: ['identityProofDocument', 'shareCertificateDocument'],
    optionalDocuments: [],
  },
  [NocType.MSEB_BILL_CHANGE]: {
    requiresBuyerInfo: false,
    requiresPurposeDescription: false,
    nocFees: 0, // Free
    transferFees: 0,
    requiredDocuments: [
      'currentElectricityBillDocument',
      'identityProofDocument',
      'shareCertificateDocument',
    ],
    optionalDocuments: [],
  },
  [NocType.OTHER]: {
    requiresBuyerInfo: false,
    requiresPurposeDescription: true,
    nocFees: 0, // Free
    transferFees: 0,
    requiredDocuments: [
      'maintenanceReceiptDocument',
      'shareCertificateDocument',
      'supportingDocuments',
      'identityProofDocument',
    ],
    optionalDocuments: [],
  },
};
