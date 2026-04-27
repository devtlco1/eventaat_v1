import type { Metadata } from 'next';
import { APP_NAME } from '@eventaat/shared';
import { almarai } from '@/lib/fonts';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: `${APP_NAME} — لوحات التحكم`,
  description: 'نماذج لوحات تشغيل عربية RTL: مطعم، إدارة، كول سنتر — بيانات وهمية من @eventaat/shared',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={almarai.variable}>
      <body className={`${almarai.className} bodyRoot`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
