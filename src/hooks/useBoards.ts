import { useState, useEffect } from 'react';

export const useBoards = () => {
  const [boards, setBoards] = useState<
    Array<{ id: string; name: string; group?: string }>
  >([]);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await fetch('/api/boards');
        const data = await response.json();
        setBoards(data);
      } catch (error) {
        console.error('Błąd podczas pobierania tablic:', error);
      }
    };

    fetchBoards();
  }, []);

  return boards;
};
