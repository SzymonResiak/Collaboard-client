'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { use } from 'react';
import BoardView from '@/components/BoardView';
import { BoardColor } from '@/types/colors';
import TaskDialog from '@/components/TaskDialog';
import { useUser } from '@/contexts/UserContext';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string; // odpowiada nazwie kolumny
}

interface Board {
  name: string;
  description: string;
  color: BoardColor;
  columns: string[];
  tasks: Task[];
  admins: string[];
}

interface TaskDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  assignees: string[];
  dueDate: string;
  board: string;
}

export default function BoardPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [board, setBoard] = useState<Board | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatedTaskId, setUpdatedTaskId] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'success' | 'error' | null>(
    null
  );

  const handleTaskClick = (taskId: string) => {
    // Znajdź task w board.tasks
    const taskToEdit = board?.tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      setSelectedTask({
        id: taskToEdit.id,
        title: taskToEdit.title,
        description: taskToEdit.description,
        status: taskToEdit.status,
        assignees: taskToEdit.assignees || [],
        dueDate: taskToEdit.dueDate,
        board: board.name,
      });
    }
  };

  const handleTaskSave = async (updatedTask: TaskDetails) => {
    setUpdatedTaskId(updatedTask.id);
    setUpdateStatus('success');

    // Aktualizujemy lokalnie task w board.tasks
    if (board) {
      const updatedTasks = board.tasks.map((task) =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      );
      setBoard({ ...board, tasks: updatedTasks });
    }
    setSelectedTask(null);

    // Reset statusu po 2 sekundach
    setTimeout(() => {
      setUpdatedTaskId(null);
      setUpdateStatus(null);
    }, 2000);
  };

  const handleTaskMove = async (
    taskId: string,
    newStatus: string,
    oldStatus: string
  ) => {
    try {
      // Najpierw aktualizujemy lokalny stan
      if (board) {
        const updatedTasks = board.tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        );
        setBoard({ ...board, tasks: updatedTasks });
      }

      // Następnie wysyłamy request do API
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      setUpdatedTaskId(taskId);
      setUpdateStatus('success');
      setTimeout(() => {
        setUpdatedTaskId(null);
        setUpdateStatus(null);
      }, 2000);
    } catch (error) {
      console.error('Error moving task:', error);

      // Przywracamy poprzedni stan w przypadku błędu
      if (board) {
        const revertedTasks = board.tasks.map((task) =>
          task.id === taskId ? { ...task, status: oldStatus } : task
        );
        setBoard({ ...board, tasks: revertedTasks });
      }

      setUpdatedTaskId(taskId);
      setUpdateStatus('error');
      setTimeout(() => {
        setUpdatedTaskId(null);
        setUpdateStatus(null);
      }, 2000);
    }
  };

  useEffect(() => {
    const fetchBoard = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const encodedName = encodeURIComponent(resolvedParams.name);
        const boardResponse = await fetch(`/api/boards/${encodedName}`);
        const boardData = await boardResponse.json();

        if (boardData.error) {
          console.error('Error fetching board:', boardData.error);
          router.push('/boards');
          return;
        }

        setBoard(boardData);
      } catch (error) {
        console.error('Error in fetchBoard:', error);
        router.push('/boards');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoard();
  }, [resolvedParams.name, user]);

  if (userLoading || isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!user) {
    return <div className="p-4">Please log in to view this board</div>;
  }

  if (!board) {
    return <div className="p-4">Board not found</div>;
  }

  return (
    <>
      <BoardView
        name={board.name}
        description={board.description}
        color={board.color}
        columns={board.columns || []}
        tasks={board.tasks || []}
        admins={board.admins}
        currentUserId={user.id}
        onBack={() => router.push('/boards')}
        onTaskClick={handleTaskClick}
        updatedTaskId={updatedTaskId}
        updateStatus={updateStatus}
        onTaskMove={handleTaskMove}
      />
      {selectedTask && (
        <TaskDialog
          task={selectedTask}
          currentUserId={user.id}
          boardAdmins={board.admins}
          onClose={() => {
            setSelectedTask(null);
            setUpdatedTaskId(null);
            setUpdateStatus(null);
          }}
          onSave={handleTaskSave}
          onError={(taskId) => {
            setUpdatedTaskId(taskId);
            setUpdateStatus('error');
          }}
        />
      )}
    </>
  );
}
