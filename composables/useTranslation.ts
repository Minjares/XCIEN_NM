import { translations } from '~/utils/translations';

export function useTranslation() {
  /**
   * Get a translation by key
   * @param key The translation key
   * @returns The translated string or the key if not found
   */
  const t = (key: string): string => {
    return (translations as Record<string, string>)[key] || key;
  };

  return {
    t
  };
}
