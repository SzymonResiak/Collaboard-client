import React from 'react';
import { TrashIcon } from '@radix-ui/react-icons';

interface ChecklistItemProps {
  item: {
    id: string;
    item: string;
    isCompleted: boolean;
    color: string;
  };
  onChange: (updatedItem: typeof item) => void;
  onRemove: () => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  item,
  onChange,
  onRemove,
}) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={item.isCompleted}
        onChange={(e) => onChange({ ...item, isCompleted: e.target.checked })}
        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
      />
      <input
        type="text"
        value={item.item}
        onChange={(e) => onChange({ ...item, item: e.target.value })}
        className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Add item"
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-red-500 hover:text-red-600"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default React.memo(ChecklistItem);
