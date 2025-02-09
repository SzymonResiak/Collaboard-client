'use client';

import { BoardColor } from '@/types/colors';
import { useState } from 'react';
import BoardEditDialog from './BoardEditDialog';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface BoardCardProps {
  id: string;
  name: string;
  description: string;
  color: BoardColor;
  columns: string[];
  tasks: Task[];
  admins: string[];
  currentUserId: string;
  onClick: () => void;
  favourite?: boolean;
  onFavouriteChange?: () => void;
}

export default function BoardCard({
  id,
  name,
  description,
  color,
  columns,
  tasks,
  admins,
  currentUserId,
  onClick,
  favourite,
  onFavouriteChange,
}: BoardCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isAdmin = admins.includes(currentUserId);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleFavouriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/boards/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          favourite: !favourite,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update favourite status');
      }

      onFavouriteChange?.();
    } catch (error) {
      console.error('Error updating favourite status:', error);
    }
  };

  // Funkcja do liczenia zadań w danej kolumnie
  const getTaskCountForColumn = (columnName: string) => {
    return tasks.filter((task) => task.status === columnName.replace(' ', '_'))
      .length;
  };

  return (
    <>
      <div
        onClick={onClick}
        className="group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
        style={{ backgroundColor: color }}
      >
        <div className="h-32 p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFavouriteClick}
                className="p-1 rounded-full hover:bg-black/10 transition-colors"
              >
                {favourite ? (
                  <svg
                    className="w-5 h-5 text-gray-900"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={handleEditClick}
                className="p-1 rounded-full hover:bg-black/10 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-gray-900 text-sm line-clamp-2">{description}</p>
        </div>
        <div className="p-4 border-t border-black/10">
          <div className="flex flex-wrap gap-2">
            {columns.map((column) => {
              const taskCount = getTaskCountForColumn(column);
              if (taskCount === 0) return null;
              return (
                <div key={column} className="flex items-center text-sm">
                  <span className="text-gray-900">{column}: </span>
                  <span className="text-gray-900 font-medium ml-1">
                    {taskCount}
                  </span>
                  <span className="text-gray-400 mx-2">•</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isEditDialogOpen && (
        <BoardEditDialog
          board={{ name, description, color, columns: [] }}
          isAdmin={isAdmin}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={async () => {
            setIsEditDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
