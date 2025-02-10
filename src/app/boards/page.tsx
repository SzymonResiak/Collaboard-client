'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BoardCard from '@/components/BoardCard';
import { BoardColor } from '@/types/colors';
import { motion, AnimatePresence } from 'framer-motion';

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
  id: string;
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
  favourite?: boolean;
}

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const fetchUserAndBoards = async () => {
      try {
        const userResponse = await fetch('/api/user');
        const userData = await userResponse.json();
        setCurrentUserId(userData.id);

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

  const refreshBoards = async () => {
    try {
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

  const handleFavouriteChange = (
    boardId: string,
    newFavouriteValue: boolean
  ) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId
          ? { ...board, favourite: newFavouriteValue }
          : board
      )
    );
  };

  // Sortowanie boardów
  const sortedBoards = [...boards].sort((a, b) => {
    if (a.favourite && !b.favourite) return -1;
    if (!a.favourite && b.favourite) return 1;
    return a.name.localeCompare(b.name, undefined, {
      sensitivity: 'base',
      numeric: true,
    });
  });

  return (
    <div className="h-full overflow-auto p-16 scrollbar-thin">
      <div className="grid grid-cols-3 gap-14 max-w-[1800px] mx-auto relative">
        <AnimatePresence>
          {sortedBoards.map((board, index) => (
            <motion.div
              key={board.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                opacity: { duration: 0.3 },
                layout: {
                  duration: 0.5,
                  type: 'spring',
                  bounce: 0.15,
                },
              }}
              className="w-fit"
            >
              <BoardCard
                id={board.id}
                name={board.name}
                description={board.description}
                color={board.color}
                columns={board.columns || []}
                tasks={board.tasks || []}
                admins={board.admins}
                currentUserId={currentUserId}
                favourite={board.favourite}
                onFavouriteChange={(newValue) =>
                  handleFavouriteChange(board.id, newValue)
                }
                onClick={() =>
                  router.push(`/boards/${encodeURIComponent(board.name)}`)
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
