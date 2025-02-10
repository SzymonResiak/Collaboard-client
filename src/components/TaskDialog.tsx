'use client';

import { useState, useMemo, useEffect, useReducer } from 'react';
import { format } from 'date-fns';
import { BOARD_COLORS } from '@/constants/boardColors';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CheckIcon, TrashIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { useForm, Controller } from 'react-hook-form';
import { Combobox } from '@headlessui/react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useBoards } from '@/hooks/useBoards';
import { useGroups } from '@/hooks/useGroups';
import AssigneesSelect from './AssigneesSelect';
import { taskDialogReducer } from '@/hooks/useTaskDialogReducer';
import {
  TaskDetails,
  Checklist,
  ChecklistItem as ChecklistItemType,
} from '@/types';

interface FormData {
  title: string;
  description?: string;
  status: string;
  board: string;
  group?: string;
  dueDate?: string;
  assignees?: string[];
  checklists: Checklist[];
}

interface TaskDialogProps {
  task: TaskDetails;
  currentUserId: string;
  boardAdmins: string[];
  boardMembers?: string[];
  hasAssignees: boolean;
  onClose: () => void;
  onSave: (updatedTask: TaskDetails) => Promise<void>;
  onError: (taskId: string) => void;
}

interface ChangedFields {
  title?: string;
  description?: string;
  status?: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  assignees?: string[];
  checklists?: Checklist[];
}

export default function TaskDialog({
  task,
  currentUserId,
  boardAdmins,
  boardMembers = [],
  hasAssignees,
  onClose,
  onSave,
  onError,
}: TaskDialogProps) {
  const [state, dispatch] = useReducer(taskDialogReducer, {
    title: task.title,
    description: task.description,
    status: task.status,
    assignees: task.assignees,
    dueDate: task.dueDate || null,
    checklists: task.checklists,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(
    task.assignees?.[0] || null
  );

  const changedFields = useMemo(() => {
    const changes: ChangedFields = {};

    if (state.title !== task.title) changes.title = state.title;
    if (state.description !== task.description)
      changes.description = state.description;
    if (state.status !== task.status) changes.status = state.status;
    if (state.dueDate !== task.dueDate) changes.dueDate = state.dueDate;

    // Porównaj assignees
    const assigneesChanged =
      JSON.stringify(state.assignees.sort()) !==
      JSON.stringify(task.assignees.sort());
    if (assigneesChanged) changes.assignees = state.assignees;

    // Porównaj checklists bez pól technicznych (id, isEditing)
    const normalizedChecklists = state.checklists.map((cl) => ({
      name: cl.name,
      items: cl.items
        .filter((item) => item.item.trim())
        .map((item) => ({
          item: item.item,
          isCompleted: item.isCompleted,
        })),
    }));

    const normalizedTaskChecklists = task.checklists.map((cl) => ({
      name: cl.name,
      items: cl.items.map((item) => ({
        item: item.item,
        isCompleted: item.isCompleted,
      })),
    }));

    if (
      JSON.stringify(normalizedChecklists) !==
      JSON.stringify(normalizedTaskChecklists)
    ) {
      changes.checklists = state.checklists;
    }

    return changes;
  }, [
    state.title,
    state.description,
    state.status,
    state.dueDate,
    state.assignees,
    state.checklists,
    task,
  ]);

  const canEdit = useMemo(() => {
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

  const getRandomColor = () => {
    const colors = [
      '#D3CCF1', // purple
      '#B8C9E8', // blue
      '#9AAB65', // green
      '#F6D868', // yellow
      '#F5B8DA', // pink
      '#FABE81', // orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    const initializedChecklists = task.checklists.map((checklist) => {
      const itemsWithColors = checklist.items.map((item) => ({
        ...item,
        id: item.id || generateId(),

        color: item.color || getRandomColor(),
      }));

      const itemsWithNewElement = [
        ...itemsWithColors,
        {
          id: generateId(),
          item: '',
          isCompleted: false,
          color: getRandomColor(),
        },
      ];

      return {
        id: checklist.id || generateId(),
        name: checklist.name,
        items: itemsWithNewElement,
        isEditing: false,
      };
    });

    if (initializedChecklists.length === 0) {
      initializedChecklists.push({
        id: generateId(),
        name: '',
        items: [
          {
            id: generateId(),
            item: '',
            isCompleted: false,
            color: getRandomColor(),
          },
        ],
        isEditing: true,
      });
    }

    dispatch({
      type: 'SET_CHECKLISTS',
      payload: initializedChecklists,
    });
  }, [task]);

  useEffect(() => {
    if (task.board) {
      dispatch({ type: 'SET_BOARD', payload: task.board });
    }
  }, [task, dispatch]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault(); // Zapobiegaj domyślnej akcji formularza
    }

    if (!canEdit || !isEditing) return;

    setIsSubmitting(true);
    try {
      const updatedData = {
        ...(state.title !== task.title && { title: state.title }),
        ...(state.description !== task.description && {
          description: state.description,
        }),
        ...(state.status !== task.status && { status: state.status }),
        ...(state.dueDate !== task.dueDate && {
          dueDate: state.dueDate ? new Date(state.dueDate).toISOString() : null,
        }),
        ...(JSON.stringify(state.assignees) !==
          JSON.stringify(task.assignees) && {
          assignees: state.assignees,
        }),
        checklists: state.checklists
          .filter(
            (checklist) => checklist.name.trim() && checklist.items.length > 0
          )
          .map((checklist) => ({
            name: checklist.name,
            items: checklist.items
              .filter((item) => item.item.trim() !== '')
              .map((item) => ({
                item: item.item,
                isCompleted: item.isCompleted,
              })),
          })),
      };

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task');
      }

      await onSave({
        ...task,
        ...changedFields,
        checklists: state.checklists,
      });

      setToast({
        message: 'Task updated successfully',
        type: 'success',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      onError(task.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingChecklist = (checklistId: string) => {
    dispatch({
      type: 'UPDATE_CHECKLIST',
      payload: {
        index: state.checklists.findIndex((cl) => cl.id === checklistId),
        checklist: {
          ...state.checklists.find((cl) => cl.id === checklistId)!,
          isEditing: true,
        },
      },
    });
    setTimeout(() => {
      const input = document.getElementById(`checklist-name-${checklistId}`);
      input?.focus();
    }, 0);
  };

  const addChecklist = () => {
    const newChecklistId = generateId();
    dispatch({
      type: 'ADD_CHECKLIST',
      payload: {
        id: newChecklistId,
        name: '',
        items: [
          // Dodaj pusty element checkboxa
          {
            id: generateId(),
            item: '',
            isCompleted: false,
            color: getRandomColor(),
          },
        ],
        isEditing: true,
      },
    });
    setTimeout(() => {
      const input = document.getElementById(`checklist-name-${newChecklistId}`);
      input?.focus();
    }, 0);
  };

  const handleAssigneeSelect = (value: string | null) => {
    setSelectedAssignee(value);
    if (value) {
      if (state.assignees.includes(value)) {
        dispatch({
          type: 'SET_ASSIGNEES',
          payload: state.assignees.filter((a) => a !== value),
        });
      } else {
        dispatch({
          type: 'SET_ASSIGNEES',
          payload: [...state.assignees, value],
        });
      }
    }
  };

  const addNewChecklistItem = (checklistIndex: number) => {
    const newItem = {
      id: generateId(),
      item: '',
      isCompleted: false,
      color: getRandomColor(),
    };

    const newChecklists = [...state.checklists];
    newChecklists[checklistIndex].items.push(newItem);

    dispatch({
      type: 'UPDATE_CHECKLIST',
      payload: {
        index: checklistIndex,
        checklist: {
          ...newChecklists[checklistIndex],
          items: newChecklists[checklistIndex].items,
        },
      },
    });
  };

  const showAssignees = hasAssignees;

  const handleAssigneesChange = (newAssignees: string[]) => {
    dispatch({ type: 'SET_ASSIGNEES', payload: newAssignees });
  };

  // Dodaj nowy useMemo do sprawdzania czy są zmiany
  const hasChanges = useMemo(() => {
    return Object.keys(changedFields).length > 0;
  }, [changedFields]);

  const handleChecklistItemChange = (
    checklistIndex: number,
    itemIndex: number,
    updatedItem: ChecklistItemType
  ) => {
    const newChecklists = [...state.checklists];
    const checklist = newChecklists[checklistIndex];
    const newItems = [...checklist.items];

    const isLastItem = itemIndex === newItems.length - 1;
    const isEmptyItem = newItems[itemIndex].item === '';

    if (isLastItem && isEmptyItem && updatedItem.item.trim() !== '') {
      newItems[itemIndex] = {
        ...updatedItem,
        item: updatedItem.item.trim(),
        color: newItems[itemIndex].color,
      };

      newItems.push({
        id: generateId(),
        item: '',
        isCompleted: false,
        color: getRandomColor(),
      });
    } else {
      newItems[itemIndex] = {
        ...updatedItem,
        color: newItems[itemIndex].color,
      };
    }

    dispatch({
      type: 'UPDATE_CHECKLIST',
      payload: {
        index: checklistIndex,
        checklist: {
          ...checklist,
          items: newItems,
        },
      },
    });
  };

  const handleChecklistItemRemove = (
    checklistIndex: number,
    itemIndex: number
  ) => {
    const newChecklists = [...state.checklists];
    const checklist = newChecklists[checklistIndex];
    const newItems = [...checklist.items];

    newItems.splice(itemIndex, 1);

    const lastItem = newItems[newItems.length - 1];
    const hasEmptyItem = lastItem && lastItem.item === '';

    if (!hasEmptyItem) {
      newItems.push({
        id: generateId(),
        item: '',
        isCompleted: false,
        color: getRandomColor(),
      });
    }

    dispatch({
      type: 'UPDATE_CHECKLIST',
      payload: {
        index: checklistIndex,
        checklist: {
          ...checklist,
          items: newItems,
        },
      },
    });
  };

  const { control } = useForm({
    defaultValues: {
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      assignees: task.assignees,
      checklists: task.checklists,
    },
  });

  const getNewItemKey = (checklistId: string, itemIndex: number) => {
    return `new-item-${checklistId}-${itemIndex}-${Date.now()}`;
  };

  return (
    <Dialog.Root open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[700px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-8 shadow-xl focus:outline-none overflow-y-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
          aria-describedby="task-dialog-description"
        >
          <Dialog.Title className="dialog-title">Edit Task</Dialog.Title>
          <Dialog.Description id="task-dialog-description" className="sr-only">
            Edit task details including title, description, due date, assignees,
            and checklists
          </Dialog.Description>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-6"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          >
            <div className="space-y-6">
              {/* Title Input */}
              <input
                value={state.title}
                onChange={(e) =>
                  dispatch({ type: 'SET_TITLE', payload: e.target.value })
                }
                className={cn(
                  'w-full px-3 py-2 rounded-lg transition-colors h-10',
                  'border border-gray-300',
                  'focus:outline-none focus:ring-0',
                  'focus:border-gray-900 focus:border-2'
                )}
                placeholder="Task title"
                disabled={!canEdit}
                autoFocus={false}
              />

              {/* Description */}
              <textarea
                value={state.description}
                onChange={(e) =>
                  dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })
                }
                className="w-full p-3 border rounded-lg text-sm resize-none overflow-y-auto focus:border-gray-900 focus:border-2 focus:outline-none"
                placeholder="Description"
                rows={4}
                style={{ maxHeight: '150px' }}
                disabled={!canEdit}
                autoFocus={false}
              />

              {/* Due Date */}
              <div className="w-1/2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-[42px]',
                        'bg-white border-gray-300 hover:bg-gray-50',
                        !state.dueDate && 'text-gray-500'
                      )}
                      disabled={!canEdit}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>
                        {state.dueDate
                          ? format(new Date(state.dueDate), 'PPP')
                          : 'Select due date...'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        state.dueDate ? new Date(state.dueDate) : undefined
                      }
                      onSelect={(date) =>
                        dispatch({
                          type: 'SET_DUE_DATE',
                          payload: date?.toISOString() || null,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Assignees */}
              {showAssignees && (
                <div className="w-full">
                  <AssigneesSelect
                    assignees={state.assignees}
                    boardMembers={boardMembers || []}
                    onChange={handleAssigneesChange}
                  />
                </div>
              )}

              {/* Checklists */}
              <div className="space-y-4">
                {state.checklists.map((checklist, index) => (
                  <div
                    key={checklist.id}
                    className="space-y-4 bg-white p-4 rounded-lg shadow-sm"
                  >
                    {checklist.isEditing ? (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <input
                            id={`checklist-name-${checklist.id}`}
                            type="text"
                            value={checklist.name}
                            onChange={(e) => {
                              dispatch({
                                type: 'UPDATE_CHECKLIST',
                                payload: {
                                  index,
                                  checklist: {
                                    ...checklist,
                                    name: e.target.value,
                                  },
                                },
                              });
                            }}
                            onBlur={() => {
                              if (checklist.name.trim()) {
                                dispatch({
                                  type: 'UPDATE_CHECKLIST',
                                  payload: {
                                    index,
                                    checklist: {
                                      ...checklist,
                                      isEditing: false,
                                    },
                                  },
                                });
                              } else {
                                dispatch({
                                  type: 'REMOVE_CHECKLIST',
                                  payload: index,
                                });
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                            className="w-full px-0 py-2 text-lg font-medium bg-transparent border-b-2 border-gray-100 focus:border-gray-900 focus:outline-none transition-colors"
                            placeholder="Checklist title"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch({
                              type: 'REMOVE_CHECKLIST',
                              payload: index,
                            })
                          }
                          className="text-red-500 hover:text-red-600 ml-4"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div
                          className="flex-1 cursor-pointer hover:opacity-70 transition-opacity"
                          onClick={() => startEditingChecklist(checklist.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              Title:
                            </span>
                            <h4 className="font-medium text-lg">
                              {checklist.name}
                            </h4>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch({
                              type: 'REMOVE_CHECKLIST',
                              payload: index,
                            })
                          }
                          className="text-red-500 hover:text-red-600 ml-4"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {!checklist.isEditing && (
                      <div className="space-y-3">
                        {checklist.items.map((item, itemIndex) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 group"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={item.isCompleted}
                                onChange={(e) => {
                                  handleChecklistItemChange(index, itemIndex, {
                                    ...item,
                                    isCompleted: e.target.checked,
                                  });
                                }}
                                className="peer h-4 w-4 rounded border-2 appearance-none focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                style={{ borderColor: item.color }}
                                disabled={
                                  itemIndex === checklist.items.length - 1 &&
                                  item.item === ''
                                }
                              />
                              <CheckIcon
                                className="absolute h-3 w-3 top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                                style={{ color: item.color }}
                              />
                            </div>
                            <input
                              type="text"
                              value={item.item}
                              onChange={(e) => {
                                handleChecklistItemChange(index, itemIndex, {
                                  ...item,
                                  item: e.target.value,
                                });
                              }}
                              className="flex-1 px-0 py-1 text-sm bg-transparent border-b border-transparent hover:border-gray-100 focus:border-gray-900 focus:outline-none transition-colors"
                              placeholder={
                                itemIndex === checklist.items.length - 1
                                  ? 'Add item'
                                  : ''
                              }
                            />
                            {itemIndex < checklist.items.length - 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleChecklistItemRemove(index, itemIndex)
                                }
                                className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="border-t my-6" />

                <button
                  type="button"
                  onClick={addChecklist}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 group"
                >
                  <div className="relative">
                    <div
                      className="h-4 w-4 rounded border-2 transition-colors group-hover:border-gray-700"
                      style={{ borderColor: getRandomColor() }}
                    />
                    <CheckIcon
                      className="absolute h-3 w-3 top-0.5 left-0.5"
                      style={{ color: getRandomColor() }}
                    />
                  </div>
                  <span>Add Checklist</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-black bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-base font-medium"
              >
                Cancel
              </button>
              {canEdit && (
                <button
                  type="submit"
                  disabled={isSubmitting || !hasChanges}
                  className="px-6 py-2.5 text-white bg-black rounded-full hover:bg-gray-800 transition-colors text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
