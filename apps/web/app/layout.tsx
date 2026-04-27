import type { Metadata } from 'next';
import { APP_NAME } from '@eventaat/shared';
import './globals.css';

export const metadata: Metadata = {
  title: `${APP_NAME} — لوحات التحكم (Phase 1A)`,
  description: 'واجهات وهمية: مطعم، إدارة، كول سنتر — بيانات من @eventaat/shared',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bodyRoot">{children}</body>
    </html>
  );
}
