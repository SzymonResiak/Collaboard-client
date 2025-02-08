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
  name: string;
  description: string;
  color: BoardColor;
  columns: string[];
  tasks: Task[];
  admins: string[];
  currentUserId: string;
  onClick: () => void;
}

export default function BoardCard({
  name,
  description,
  color,
  columns,
  tasks,
  admins,
  currentUserId,
  onClick,
}: BoardCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isAdmin = admins.includes(currentUserId);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
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
      >
        <div className="h-32 p-4" style={{ backgroundColor: color }}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-white">{name}</h3>
            <button
              onClick={handleEditClick}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
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
          <p className="text-white/80 text-sm line-clamp-2">{description}</p>
        </div>
        <div className="bg-white p-4 border-t">
          <div className="flex flex-wrap gap-2">
            {columns.map((column) => {
              const taskCount = getTaskCountForColumn(column);
              if (taskCount === 0) return null;
              return (
                <div key={column} className="flex items-center text-sm">
                  <span className="text-gray-600">{column}: </span>
                  <span className="text-gray-900 font-medium ml-1">
                    {taskCount}
                  </span>
                  <span className="text-gray-300 mx-2">•</span>
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
          onSave={async (updatedBoard) => {
            // Implementacja zapisu zmian
            setIsEditDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
