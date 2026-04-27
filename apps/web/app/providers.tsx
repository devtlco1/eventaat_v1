'use client';

import { WebAuthProvider } from '@/components/auth/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <WebAuthProvider>{children}</WebAuthProvider>;
}
