import { useState, useEffect } from 'react';
import { TaskDetails } from '@/types';

interface UseFetchBoardsResult {
  boards: TaskDetails[];
  loading: boolean;
  error: string | null;
}

const useFetchBoards = (): UseFetchBoardsResult => {
  const [boards, setBoards] = useState<TaskDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await fetch('/api/boards');
        const data = await response.json();
        setBoards(data);
      } catch (err) {
        setError('Błąd podczas pobierania tablic.');
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  return { boards, loading, error };
};

export default useFetchBoards;
