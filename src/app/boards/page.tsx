'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BoardCard from '@/components/BoardCard';
import { BoardColor } from '@/types/colors';

interface Column {
  id: string;
  name: string;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
  }>;
}

interface Board {
  name: string;
  description: string;
  color: BoardColor;
  columns: Column[];
  admins: string[];
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
  }>;
}

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const fetchUserAndBoards = async () => {
      try {
        // Pobierz ID zalogowanego użytkownika
        const userResponse = await fetch('/api/user');
        const userData = await userResponse.json();
        setCurrentUserId(userData.id);

        // Pobierz tablice
        const boardsResponse = await fetch('/api/boards');
        const boardsData = await boardsResponse.json();

        if (boardsData.error) {
          console.error('Error fetching boards:', boardsData.error);
          return;
        }

        setBoards(boardsData);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserAndBoards();
  }, []);

  return (
    <div className="h-full overflow-auto">
      <h1 className="text-2xl font-bold mb-6">Your Boards</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {boards.map((board) => (
          <BoardCard
            key={board.name}
            name={board.name}
            description={board.description}
            color={board.color}
            columns={board.columns || []}
            tasks={board.tasks || []}
            admins={board.admins}
            currentUserId={currentUserId}
            onClick={() =>
              router.push(`/boards/${encodeURIComponent(board.name)}`)
            }
          />
        ))}
      </div>
    </div>
  );
}
