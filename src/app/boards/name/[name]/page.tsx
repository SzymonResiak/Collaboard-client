'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Board = {
  id: number;
  name: string;
  description: string;
};

export default function BoardDetailPage() {
  const { name } = useParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;

    const decodedName = decodeURIComponent(name as string);
    fetch(`/api/boards/name/${encodeURIComponent(decodedName)}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok');
      })
      .then((boardData) => {
        if (boardData.error) {
          console.error('Failed to fetch board:', boardData.error);
          setError('Failed to fetch board');
        } else {
          setBoard(boardData);
        }
      })
      .catch((error) => {
        console.error('An error occurred:', error);
        setError('An error occurred while fetching the board');
      });
  }, [name]);

  if (error) return <p>{error}</p>;
  if (!board) return <p>Loading...</p>;

  return (
    <div>
      <h1>{board.name}</h1>
      <p>{board.description}</p>
    </div>
  );
}
