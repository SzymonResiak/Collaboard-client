'use client';

import { BoardColor } from '@/types/colors';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface BoardViewProps {
  name: string;
  description: string;
  color: BoardColor;
  columns: string[];
  tasks: Task[];
  admins: string[];
  currentUserId: string;
  onBack: () => void;
  onTaskClick: (taskId: string) => void;
  updatedTaskId?: string | null;
  updateStatus?: 'success' | 'error' | null;
  onTaskMove: (
    taskId: string,
    newStatus: string,
    oldStatus: string
  ) => Promise<void>;
}

export default function BoardView({
  name,
  description,
  color,
  columns = [],
  tasks = [],
  admins,
  currentUserId,
  onBack,
  onTaskClick,
  updatedTaskId,
  updateStatus,
  onTaskMove,
}: BoardViewProps) {
  const isAdmin = admins.includes(currentUserId);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const getTasksForColumn = (columnName: string) => {
    return localTasks.filter((task) => task.status === columnName);
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 select-none">
              {name}
            </h1>
            <p className="text-gray-600 select-none">{description}</p>
          </div>
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          )}
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DragDropContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full space-x-6 p-6">
            {columns.map((columnName) => (
              <div
                key={columnName}
                className="flex-shrink-0 w-80 bg-gray-50 rounded-xl"
              >
                <div
                  className="p-3 rounded-t-xl"
                  style={{ backgroundColor: color }}
                >
                  <h3 className="text-white font-medium select-none">
                    {columnName}
                  </h3>
                </div>
                <Droppable
                  droppableId={columnName}
                  isDropDisabled={false}
                  isCombineEnabled={false}
                  ignoreContainerClipping={false}
                  type="task"
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-3 space-y-3 min-h-[200px] transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-gray-100' : ''
                      }`}
                    >
                      {getTasksForColumn(columnName).map((task, index) => (
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
                                onTaskClick(task.id);
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
                              <p className="text-sm text-gray-600 line-clamp-2 select-none">
                                {task.description}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
