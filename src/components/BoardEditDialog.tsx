'use client';

import { useState } from 'react';
import { BOARD_COLORS, BoardColor } from '@/constants/boardColors';

interface Column {
  id: string;
  name: string;
}

interface BoardEditDialogProps {
  board: {
    name: string;
    description: string;
    color: BoardColor;
    columns: Column[];
  };
  isAdmin: boolean;
  onClose: () => void;
  onSave: (board: {
    name: string;
    description: string;
    color: BoardColor;
    columns: Column[];
  }) => Promise<void>;
}

export default function BoardEditDialog({
  board,
  isAdmin,
  onClose,
  onSave,
}: BoardEditDialogProps) {
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description);
  const [color, setColor] = useState<BoardColor>(
    board.color || BOARD_COLORS[0]
  );
  const [columns, setColumns] = useState<Column[]>(board.columns);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({ name, description, color, columns });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddColumn = () => {
    setColumns([...columns, { id: `new-${Date.now()}`, name: 'New Column' }]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Edytuj tablicę</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa tablicy
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kolor tablicy
              </label>
              <div className="flex gap-2">
                {BOARD_COLORS.map((colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === colorOption
                        ? 'border-blue-500'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: colorOption }}
                    onClick={() => setColor(colorOption as BoardColor)}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Columns
                </label>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Column
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {columns.map((column, index) => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => {
                        const newColumns = [...columns];
                        newColumns[index] = {
                          ...column,
                          name: e.target.value,
                        };
                        setColumns(newColumns);
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!isAdmin}
                    />
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setColumns(columns.filter((_, i) => i !== index));
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
