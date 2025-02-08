'use client';

import { UserProvider } from '@/contexts/UserContext';
import Navbar from '@/components/Navbar';
import ClientLayout from '@/components/ClientLayout';

interface RootClientLayoutProps {
  children: React.ReactNode;
  geistSansVariable: string;
  geistMonoVariable: string;
}

export default function RootClientLayout({ children }: RootClientLayoutProps) {
  return (
    <UserProvider>
      <Navbar />
      <ClientLayout>{children}</ClientLayout>
    </UserProvider>
  );
}
