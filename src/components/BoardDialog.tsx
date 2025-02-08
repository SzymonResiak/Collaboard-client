'use client';

interface BoardDialogProps {
  board: {
    name: string;
    description: string;
    tasks?: Array<{
      id: string;
      name: string;
      status: string;
    }>;
  };
  onClose: () => void;
}

export default function BoardDialog({ board, onClose }: BoardDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {board.name}
            </h2>
            <p className="text-gray-600">{board.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
          <div className="grid grid-cols-1 gap-4">
            {board.tasks?.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-900">{task.name}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
