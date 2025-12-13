/**
 * External links configuration
 * Centralizes all external URLs used in the application
 */
export const EXTERNAL_LINKS = {
  /** Portuguese communications regulator */
  ANACOM: 'https://www.anacom.pt',
  /** Portuguese ham radio association */
  REP: 'https://www.rep.pt',
} as const;

export type ExternalLinkKey = keyof typeof EXTERNAL_LINKS;
