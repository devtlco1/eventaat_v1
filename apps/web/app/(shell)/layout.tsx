import { AuthGate } from '@/components/auth/AuthGate';
import { DashboardShell } from '@/components/shell/DashboardShell';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <DashboardShell>{children}</DashboardShell>
    </AuthGate>
  );
}
