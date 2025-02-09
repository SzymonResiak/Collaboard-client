'use client';

import { UserProvider } from '@/contexts/UserContext';
import ClientLayout from '@/components/ClientLayout';

interface RootClientLayoutProps {
  children: React.ReactNode;
  geistSansVariable: string;
  geistMonoVariable: string;
}

export default function RootClientLayout({ children }: RootClientLayoutProps) {
  return (
    <UserProvider>
      <ClientLayout>{children}</ClientLayout>
    </UserProvider>
  );
}
