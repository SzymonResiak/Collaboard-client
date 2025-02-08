'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import CreateTaskForm from '@/components/CreateTaskForm';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return children;
  }

  const handleCreateTask = async (data: {
    name: string;
    description: string;
  }) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <nav className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* User Panel - lewa strona */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              {/* Placeholder na avatar */}
              <span className="text-blue-600 font-medium">A</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Username</p>
              <p className="text-sm text-gray-600">#12345</p>
            </div>
          </div>

          {/* Navigation Links - środek */}
          <div className="flex items-center space-x-6">
            <Link
              href="/boards"
              className={`text-gray-600 hover:text-blue-600 font-medium ${
                pathname === '/boards' ? 'text-blue-600' : ''
              }`}
            >
              Boards
            </Link>
            <Link
              href="/groups"
              className={`text-gray-600 hover:text-blue-600 font-medium ${
                pathname === '/groups' ? 'text-blue-600' : ''
              }`}
            >
              Groups
            </Link>
          </div>

          {/* Create Task Button - prawa strona */}
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            + Create Task
          </button>
        </div>
      </nav>
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto bg-white h-full rounded-lg shadow-lg p-6">
          {children}
        </div>
      </main>

      {/* Modal do tworzenia zadania */}
      {isTaskModalOpen && (
        <CreateTaskForm
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={handleCreateTask}
        />
      )}
    </div>
  );
}
