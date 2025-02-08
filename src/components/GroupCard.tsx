'use client';

interface GroupCardProps {
  name: string;
  description: string;
  membersCount: number;
  onClick: () => void;
}

export default function GroupCard({
  name,
  description,
  membersCount,
  onClick,
}: GroupCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        <div className="flex items-center space-x-1 text-gray-500">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>{membersCount}</span>
        </div>
      </div>
      <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
    </div>
  );
}
