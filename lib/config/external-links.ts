/**
 * External links configuration
 * Centralizes all external URLs used in the application
 */
export const EXTERNAL_LINKS = {
  /** Portuguese communications regulator */
  ANACOM: 'https://www.anacom.pt',
  /** Ham radio clubs / associations directory */
  CLUBS: 'https://radioamador.info/associations',
  /** GitHub repository */
  GITHUB_REPO: 'https://github.com/RadioEscola-pt/radioescola',
  /** GitHub issues for error reporting */
  GITHUB_ISSUES: 'https://github.com/RadioEscola-pt/radioescola/issues',
  /** Telegram group */
  TELEGRAM: 'https://t.me/+xQNzwNwb2JIxMWY8',
  /** Google Play app */
  GOOGLE_PLAY: 'https://play.google.com/store/apps/details?id=com.andradator.escoladeradioamador',
} as const;

export type ExternalLinkKey = keyof typeof EXTERNAL_LINKS;
