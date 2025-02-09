import { useState, useEffect } from 'react';

interface Group {
  id: string;
  name: string;
  members: string[];
  admins: string[];
  boards: string[];
}

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);

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

  return groups;
}
