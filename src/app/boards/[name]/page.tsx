'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { use } from 'react';
import BoardView from '@/components/BoardView';
import { BoardColor } from '@/types/colors';
import TaskDialog from '@/components/TaskDialog';
import { useUser } from '@/contexts/UserContext';
import CreateTaskDialog from '@/components/CreateTaskDialog';
import { useBoards } from '@/hooks/useBoards';
import { useGroups } from '@/hooks/useGroups';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assignees?: string[];
  dueDate?: string;
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
  dueDate?: string;
  board: string;
}

export default function BoardPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const router = useRouter();
  const { user } = useUser();
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [updatedTaskId, setUpdatedTaskId] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'success' | 'error' | null>(
    null
  );
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const boards = useBoards();
  const groups = useGroups();

  const { name } = use(params);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setIsLoading(true);
        const encodedName = encodeURIComponent(name);
        const response = await fetch(`/api/boards/name/${encodedName}`);
        const data = await response.json();

        if (data.error) {
          console.error('Error fetching board:', data.error);
          router.push('/boards');
          return;
        }

        setBoard(data);
      } catch (error) {
        console.error('Error:', error);
        router.push('/boards');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchBoard();
    }
  }, [name, user, router]);

  const handleTaskClick = (taskId: string) => {
    if (!board) return;

    const taskToEdit = board.tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      setSelectedTask(taskToEdit);
    }
  };

  const handleTaskSave = async (updatedTask: TaskDetails) => {
    setUpdatedTaskId(updatedTask.id);
    setUpdateStatus('success');

    if (board) {
      const updatedTasks = board.tasks.map((task) =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      );
      setBoard({ ...board, tasks: updatedTasks });
    }
    setSelectedTask(null);

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
      if (board) {
        const updatedTasks = board.tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        );
        setBoard({ ...board, tasks: updatedTasks });
      }

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

  const handleTaskCreate = async (newTask: any) => {
    if (board) {
      try {
        const updatedTasks = [...board.tasks, newTask];
        setBoard({
          ...board,
          tasks: updatedTasks,
        });

        const encodedName = encodeURIComponent(name);
        const boardResponse = await fetch(`/api/boards/name/${encodedName}`, {
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        });

        if (!boardResponse.ok) {
          throw new Error('Failed to refresh board data');
        }

        const boardData = await boardResponse.json();
        setBoard(boardData);
      } catch (error) {
        console.error('Error refreshing board:', error);
      }
    }
  };

  if (isLoading) {
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
        onCreateTask={() => setCreateTaskOpen(true)}
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
      <CreateTaskDialog
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        boards={boards}
        groups={groups}
        onTaskCreate={handleTaskCreate}
      />
    </>
  );
}
