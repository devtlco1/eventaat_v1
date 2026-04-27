import type { Metadata } from 'next';
import { APP_NAME } from '@eventaat/shared';
import './globals.css';

export const metadata: Metadata = {
  title: `${APP_NAME} — web dashboard`,
  description: 'eventaat web dashboards (restaurant, operations) — foundation shell',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bodyRoot">{children}</body>
    </html>
  );
}
