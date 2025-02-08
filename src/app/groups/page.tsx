'use client';

import { useState, useEffect } from 'react';
import GroupCard from '@/components/GroupCard';
import GroupDialog from '@/components/GroupDialog';

interface Group {
  name: string;
  description: string;
  members: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        const data = await response.json();

        if (data.error) {
          console.error('Error fetching groups:', data.error);
          return;
        }

        setGroups(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupClick = (group: Group) => {
    setSelectedGroup(group);
    setIsDialogOpen(true);
  };

  return (
    <div className="h-full overflow-auto">
      <h1 className="text-2xl font-bold mb-6">Groups</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {groups.map((group) => (
          <GroupCard
            key={group.name}
            name={group.name}
            description={group.description}
            membersCount={group.members.length}
            onClick={() => handleGroupClick(group)}
          />
        ))}
      </div>

      {isDialogOpen && selectedGroup && (
        <GroupDialog
          group={selectedGroup}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </div>
  );
}
