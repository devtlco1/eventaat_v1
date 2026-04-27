import { Almarai } from 'next/font/google';

/**
 * Almarai for Arabic RTL web dashboards (UI Recovery + Dashboard Polish).
 * Weights per Google Fonts spec.
 */
export const almarai = Almarai({
  weight: ['300', '400', '700', '800'],
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-almarai',
});
