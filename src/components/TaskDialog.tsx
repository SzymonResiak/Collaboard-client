'use client';

import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
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

interface TaskDialogProps {
  task: TaskDetails;
  currentUserId: string;
  boardAdmins: string[];
  onClose: () => void;
  onSave: (updatedTask: TaskDetails) => Promise<void>;
  onError: (taskId: string) => void;
}

interface ChangedFields {
  title?: string;
  description?: string;
  dueDate?: string;
  assignees?: string[];
}

export default function TaskDialog({
  task,
  currentUserId,
  boardAdmins,
  onClose,
  onSave,
  onError,
}: TaskDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [assignees, setAssignees] = useState(task.assignees);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const changedFields = useMemo(() => {
    const changes: ChangedFields = {};

    if (title !== task.title) changes.title = title;
    if (description !== task.description) changes.description = description;
    if (dueDate !== task.dueDate) changes.dueDate = dueDate;
    if (JSON.stringify(assignees) !== JSON.stringify(task.assignees)) {
      changes.assignees = assignees;
    }

    return changes;
  }, [title, description, dueDate, assignees, task]);

  const canEdit = useMemo(() => {
    console.log('Checking edit permissions:', {
      currentUserId,
      boardAdmins,
      assignees: task.assignees,
      isAdmin: boardAdmins.includes(currentUserId),
      isAssignee: task.assignees.includes(currentUserId),
    });
    return (
      boardAdmins.includes(currentUserId) ||
      task.assignees.includes(currentUserId)
    );
  }, [currentUserId, boardAdmins, task.assignees]);

  useEffect(() => {
    if (canEdit) {
      setIsEditing(true);
    }
  }, [canEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !isEditing || Object.keys(changedFields).length === 0)
      return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changedFields),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task');
      }

      await onSave({
        ...task,
        ...changedFields,
      });

      setToast({
        message: 'Task updated successfully',
        type: 'success',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving task:', error);
      onError(task.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div
          className={`bg-white rounded-xl w-full max-w-2xl overflow-hidden border-2 transition-all ${
            toast?.type === 'success' ? 'animate-success-pulse' : ''
          } ${
            toast?.type === 'error' ? 'border-red-500' : 'border-transparent'
          }`}
        >
          {toast?.type === 'error' && (
            <div className="bg-red-500 text-white px-4 py-2 text-sm font-medium animate-fade-in">
              Update failed
            </div>
          )}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-2xl font-bold w-full px-2 py-1 border rounded"
                      disabled={!canEdit}
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">
                      {title}
                    </h2>
                  )}
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className={`text-gray-600 hover:text-gray-900 p-2 ${
                      isEditing ? 'bg-gray-100' : ''
                    }`}
                  >
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
                        d={
                          isEditing
                            ? 'M5 13l4 4L19 7'
                            : 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        }
                      />
                    </svg>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg resize-none h-32"
                    disabled={!canEdit}
                  />
                ) : (
                  <p className="text-gray-600">{description}</p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <div className="flex items-center">
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={dueDate.slice(0, 16)}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                        disabled={!canEdit}
                      />
                    ) : (
                      <span className="text-gray-600">
                        {format(new Date(dueDate), 'PPP')}
                      </span>
                    )}
                    <svg
                      className="w-5 h-5 ml-2 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignees
                </label>
                <div className="space-y-2">
                  {assignees.map((assigneeId) => (
                    <div
                      key={assigneeId}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span>{assigneeId}</span>
                      {isEditing && canEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            setAssignees(
                              assignees.filter((id) => id !== assigneeId)
                            )
                          }
                          className="text-red-600 hover:text-red-700"
                        >
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && canEdit && (
                    <button
                      type="button"
                      className="w-full py-2 text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center"
                    >
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add Assignee
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Close
                </button>
                {canEdit && (
                  <button
                    type="submit"
                    disabled={
                      isSubmitting || Object.keys(changedFields).length === 0
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
