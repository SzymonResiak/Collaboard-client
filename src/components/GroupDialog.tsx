'use client';

interface GroupDialogProps {
  group: {
    name: string;
    description: string;
    members: Array<{
      id: string;
      name: string;
      role: string;
    }>;
  };
  onClose: () => void;
}

export default function GroupDialog({ group, onClose }: GroupDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {group.name}
            </h2>
            <p className="text-gray-600">{group.description}</p>
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
          <h3 className="text-lg font-semibold text-gray-900">Members</h3>
          <div className="grid grid-cols-1 gap-4">
            {group.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {member.name[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-900">{member.name}</span>
                </div>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
