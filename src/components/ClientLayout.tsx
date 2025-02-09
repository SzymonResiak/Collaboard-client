'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import CreateTaskDialog from '@/components/CreateTaskDialog';
import { PlusIcon, CopyIcon } from '@radix-ui/react-icons';
import { useBoards } from '@/hooks/useBoards';
import { useGroups } from '@/hooks/useGroups';

interface User {
  id: string;
  name: string;
  memberCode: string; // lepsza nazwa niż customId
}

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const boards = useBoards();
  const groups = useGroups();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const copyMemberCode = () => {
    if (user?.memberCode) {
      navigator.clipboard.writeText(user.memberCode);
      // Opcjonalnie: Dodaj powiadomienie o skopiowaniu
    }
  };

  if (pathname === '/login' || pathname === '/register') {
    return children;
  }

  return (
    <div className="flex h-screen flex-col">
      <nav className="py-6 px-16">
        <div className="max-w-[1920px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-xl">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {user?.name || 'Loading...'}
              </p>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <span>#{user?.memberCode || '-----'}</span>
                <button
                  onClick={copyMemberCode}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <CopyIcon className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              href="/boards"
              className={`text-gray-600 hover:text-blue-600 font-medium text-lg relative pb-2 ${
                pathname === '/boards'
                  ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gray-900'
                  : ''
              }`}
            >
              My Boards
            </Link>
            <Link
              href="/groups"
              className={`text-gray-600 hover:text-blue-600 font-medium text-lg relative pb-2 ${
                pathname === '/groups'
                  ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gray-900'
                  : ''
              }`}
            >
              Groups
            </Link>
            <Button
              onClick={() => setCreateTaskOpen(true)}
              variant="default"
              className="!bg-gray-900 !text-white !px-8 !py-3 !rounded-full hover:!bg-gray-800 transition-colors !text-lg"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              Create Task
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 px-16 pt-8 min-h-0">
        <div className="w-full h-full bg-white rounded-t-[32px] shadow-lg p-8 overflow-hidden flex flex-col">
          {children}
        </div>
      </main>

      <CreateTaskDialog
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        boards={boards}
        groups={groups}
      />
    </div>
  );
}
