'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const pathname = usePathname();

  // Nie pokazuj navbara na stronach logowania i rejestracji
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 py-4 px-6 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* User Panel - lewa strona */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {/* Placeholder na avatar */}
            <span className="text-black">A</span>
          </div>
          <div>
            <p className="font-semibold text-black">Username</p>
            <p className="text-sm text-black">#12345</p>
          </div>
        </div>

        {/* Navigation Links - środek */}
        <div className="flex items-center space-x-6">
          <Link
            href="/boards"
            className={`text-black hover:text-blue-600 font-medium ${
              pathname === '/boards' ? 'text-blue-600' : ''
            }`}
          >
            Boards
          </Link>
          <Link
            href="/groups"
            className={`text-black hover:text-blue-600 font-medium ${
              pathname === '/groups' ? 'text-blue-600' : ''
            }`}
          >
            Groups
          </Link>
        </div>

        {/* Create Task Button - prawa strona */}
        <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">
          + Create Task
        </button>
      </div>
    </nav>
  );
}
