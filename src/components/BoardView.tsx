'use client';

import { BoardColor } from '@/types/colors';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { useState, useEffect, useMemo } from 'react';
import { StrictModeDroppable } from './StrictModeDroppable';
import { useBoards } from '@/hooks/useBoards';
import { useGroups } from '@/hooks/useGroups';
import TaskDialog from './TaskDialog';
import useFetchBoards from '@/hooks/useFetchBoards';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface Column {
  name: string;
  color: string;
}

interface BoardViewProps {
  name: string;
  description: string;
  color: BoardColor;
  columns: Column[];
  tasks: Task[];
  admins: string[];
  currentUserId: string;
  onBack: () => void;
  updatedTaskId?: string | null;
  updateStatus?: 'success' | 'error' | null;
  onTaskMove: (
    taskId: string,
    newStatus: string,
    oldStatus: string
  ) => Promise<void>;
}

const getColumnWidth = (columnCount: number) => {
  switch (columnCount) {
    case 1:
      return 'w-[500px]';
    case 2:
      return 'w-[450px]';
    case 3:
      return 'w-[400px]';
    case 4:
      return 'w-[280px]';
    default:
      return 'w-[260px]';
  }
};

export default function BoardView({
  name,
  description,
  color,
  columns = [],
  tasks = [],
  admins,
  currentUserId,
  onBack,
  updatedTaskId,
  updateStatus,
  onTaskMove,
}: BoardViewProps) {
  const isAdmin = admins.includes(currentUserId);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState(tasks);
  const boards = useBoards();
  const groups = useGroups();
  const { boards: fetchedBoards, loading, error } = useFetchBoards();

  const currentBoard = useMemo(() => {
    const board = boards?.find((b) => b.name === name);
    return board;
  }, [boards, name]);

  const hasAssignees = useMemo(() => {
    return currentBoard?.group !== undefined;
  }, [currentBoard?.group]);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const getTasksForColumn = (column: Column) => {
    return localTasks.filter(
      (task) => task.status === column.name.replace(' ', '_').toUpperCase()
    );
  };

  const handleDragStart = (start: any) => {
    setDraggingId(start.draggableId);
  };

  const handleDragEnd = async (result: DropResult) => {
    setDraggingId(null);
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    if (sourceColumn === destColumn) return;

    try {
      const updatedTasks = localTasks.map((task) =>
        task.id === draggableId ? { ...task, status: destColumn } : task
      );
      setLocalTasks(updatedTasks);

      await onTaskMove(draggableId, destColumn, sourceColumn);
    } catch (error) {
      console.error('Error moving task:', error);
      setLocalTasks(tasks);
    }
  };

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskDialogClose = () => {
    setSelectedTask(null);
  };

  const handleTaskSave = async (updatedTask: Task) => {
    try {
      // Aktualizuj lokalny stan
      setLocalTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );

      // Zamknij dialog
      setSelectedTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      handleTaskError(updatedTask.id);
    }
  };

  const handleTaskError = (taskId: string) => {};

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <button className="text-gray-600 hover:text-gray-900">
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
                />
              </svg>
            </button>
          )}
          <button className="text-gray-600 hover:text-gray-900"></button>
        </div>
      </div>

      <div className="flex-1 p-12">
        <DragDropContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-12 justify-center">
            {columns.map((column) => (
              <div
                key={column.name}
                className={`flex-shrink-0 ${getColumnWidth(
                  columns.length
                )} flex flex-col rounded-[24px]`}
                style={{ backgroundColor: column.color }}
              >
                <div className="p-3">
                  <h3 className="text-white font-medium select-none">
                    {column.name}
                  </h3>
                </div>
                <StrictModeDroppable
                  droppableId={column.name.replace(' ', '_').toUpperCase()}
                  isDropDisabled={false}
                  isCombineEnabled={false}
                  ignoreContainerClipping={false}
                  type="task"
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-3 space-y-3 overflow-y-scroll overflow-x-hidden h-[calc(100vh-350px)] transition-colors duration-200 column-scroll ${
                        snapshot.isDraggingOver ? 'bg-white/5' : ''
                      }`}
                    >
                      {getTasksForColumn(column).map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                          isDragDisabled={
                            draggingId !== null && draggingId !== task.id
                          }
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={(e) => {
                                e.preventDefault();
                                handleTaskClick(task);
                              }}
                              style={{
                                ...provided.draggableProps.style,
                                cursor:
                                  draggingId && draggingId !== task.id
                                    ? 'not-allowed'
                                    : 'grab',
                                transform: snapshot.isDragging
                                  ? provided.draggableProps.style?.transform
                                  : 'none',
                              }}
                              className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-2 select-none ${
                                snapshot.isDragging ? 'shadow-lg scale-105' : ''
                              } ${
                                task.id === updatedTaskId
                                  ? updateStatus === 'success'
                                    ? 'animate-success-pulse'
                                    : updateStatus === 'error'
                                    ? 'border-red-500'
                                    : 'border-transparent'
                                  : 'border-transparent'
                              }`}
                            >
                              {task.id === updatedTaskId &&
                                updateStatus === 'error' && (
                                  <div className="bg-red-500 text-white px-4 py-2 text-sm font-medium animate-fade-in mb-2 -mt-2 -mx-4 rounded-t-lg">
                                    Update failed
                                  </div>
                                )}
                              <h4 className="font-medium text-gray-900 mb-1 select-none">
                                {task.title}
                              </h4>
                              <p className="text-sm text-gray-900 line-clamp-2 select-none">
                                {task.description}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </StrictModeDroppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {selectedTask && (
        <TaskDialog
          task={selectedTask}
          currentUserId={currentUserId}
          boardAdmins={admins}
          boardMembers={
            currentBoard?.group
              ? groups?.find((g) => g.id === currentBoard.group)?.members
              : []
          }
          hasAssignees={hasAssignees}
          onClose={handleTaskDialogClose}
          onSave={handleTaskSave}
          onError={handleTaskError}
        />
      )}
    </div>
  );
}
