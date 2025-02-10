import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import {
  CalendarIcon,
  ChevronDownIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CheckIcon } from '@radix-ui/react-icons';
import { Combobox } from '@headlessui/react';
import { useTheme } from '@/context/ThemeContext';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  boards: Array<{
    id: string;
    name: string;
    group?: string;
    columns: Array<{
      name: string;
      color: string;
    }>;
  }>;
  groups: Array<{
    id: string;
    name: string;
    boards: string[];
    members: string[];
    admins: string[];
  }>;
  onTaskCreate?: (task: any) => void;
}

interface ChecklistItem {
  item: string;
  isCompleted: boolean;
  color: string;
}

interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
  isEditing: boolean;
}

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

interface User {
  id: string;
  name: string;
}

export default function CreateTaskDialog({
  open,
  onClose,
  boards,
  groups,
  onTaskCreate,
}: CreateTaskDialogProps) {
  const [mode, setMode] = useState<'OWN' | 'GROUP'>('OWN');
  const {
    control,
    watch,
    setValue,
    reset,
    register,
    handleSubmit: formHandleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      status: '',
      board: '',
      assignees: [],
      checklists: [],
    },
    reValidateMode: 'onSubmit',
    shouldFocusError: false,
  });

  const {
    fields: checklistFields,
    append: appendChecklist,
    remove: removeChecklist,
  } = useFieldArray({ control, name: 'checklists' });

  const watchedBoard = watch('board');
  const watchedGroup = watch('group');

  const filteredBoards =
    mode === 'OWN'
      ? boards.filter((b) => !b.group)
      : watchedGroup
      ? boards.filter((b) => b.group === watchedGroup)
      : boards.filter((b) => b.group);

  const handleModeChange = (checked: boolean) => {
    const newMode = checked ? 'GROUP' : 'OWN';
    setMode(newMode);
    setValue('board', '');
    setValue('group', '');

    if (newMode === 'OWN') {
      const ownBoards = boards.filter((b) => !b.group);
      if (ownBoards.length === 1) {
        setValue('board', ownBoards[0].id);
      }
    } else if (newMode === 'GROUP') {
      if (groups.length === 1) {
        setValue('group', groups[0].id);
        const groupBoards = boards.filter((b) => b.group === groups[0].id);
        if (groupBoards.length === 1) {
          setValue('board', groupBoards[0].id);
        }
      }
    }
  };

  useEffect(() => {
    if (mode === 'OWN') {
      const ownBoards = boards.filter((b) => !b.group);
      if (ownBoards.length === 1 && !watchedBoard) {
        setValue('board', ownBoards[0].id);
      }
    } else if (mode === 'GROUP' && !watchedGroup) {
      if (groups.length === 1) {
        setValue('group', groups[0].id);
        const groupBoards = boards.filter((b) => b.group === groups[0].id);
        if (groupBoards.length === 1 && !watchedBoard) {
          setValue('board', groupBoards[0].id);
        }
      }
    }
  }, [mode, boards, groups, watchedBoard, watchedGroup, setValue]);

  useEffect(() => {
    if (open) {
      reset({
        title: '',
        description: '',
        status: '',
        board: '',
        assignees: [],
        checklists: [],
      });
      setIsAssigneesOpen(false);
      setChecklists([]);
      setDueDate(null);
    }
  }, [open, reset]);

  const handleBoardChange = (boardId: string) => {
    setValue('board', boardId);
    const selectedBoard = boards.find((b) => b.id === boardId);
    if (selectedBoard?.group) {
      setValue('group', selectedBoard.group);
      setMode('GROUP');
    }
  };

  const handleGroupChange = (groupId: string) => {
    setValue('group', groupId);
    const groupBoard = boards.find((b) => b.group === groupId);
    if (groupBoard) {
      setValue('board', groupBoard.id);
    }
  };

  useEffect(() => {
    if (watchedBoard) {
      const selectedBoard = boards.find((board) => board.id === watchedBoard);
      if (selectedBoard?.columns?.[0]) {
        setValue(
          'status',
          selectedBoard.columns[0].name.replace(' ', '_').toUpperCase()
        );
      }
    }
  }, [watchedBoard, boards, setValue]);

  const handleValidSubmit = async (formData: FormData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || '',
          status: formData.status,
          board: formData.board,
          dueDate: formData.dueDate
            ? new Date(formData.dueDate).toISOString().slice(0, 16)
            : null,
          assignees: formData.assignees || [],
          checklists: checklists
            .filter(
              (checklist) => checklist.name.trim() && checklist.items.length > 0
            )
            .map((checklist) => ({
              name: checklist.name,
              items: checklist.items
                .filter((item) => item.item?.trim() !== '')
                .map((item) => ({
                  item: item.item || '',
                  isCompleted: item.isCompleted,
                })),
            })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      if (onTaskCreate) {
        onTaskCreate(data);
      }
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const buttonVariants = {
    variants: {
      variant: {
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
      },
    },
  };

  const [isAssigneesOpen, setIsAssigneesOpen] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);

  const handleAssigneeSelect = (user: User) => {
    setSelectedAssignees([user]);
    setIsAssigneesOpen(false);
  };

  const [dueDate, setDueDate] = useState<Date | null>(null);

  const [checklists, setChecklists] = useState<Checklist[]>([]);

  const { colors } = useTheme();

  const getRandomColor = () => {
    const colorValues = Object.values(colors);
    return colorValues[Math.floor(Math.random() * colorValues.length)];
  };

  const addChecklist = () => {
    const newChecklistId = Date.now().toString();
    setChecklists([
      ...checklists,
      { id: newChecklistId, name: '', items: [], isEditing: true },
    ]);
    setTimeout(() => {
      const input = document.getElementById(`checklist-name-${newChecklistId}`);
      input?.focus();
    }, 0);
  };

  const startEditingChecklist = (checklistId: string) => {
    setChecklists(
      checklists.map((list) =>
        list.id === checklistId ? { ...list, isEditing: true } : list
      )
    );
    setTimeout(() => {
      const input = document.getElementById(`checklist-name-${checklistId}`);
      input?.focus();
    }, 0);
  };

  const formatAssigneesDisplay = (
    assignees: Array<{ id: string; name: string }>
  ) => {
    if (assignees.length === 0) return 'For: Select assignee...';
    const names = assignees.map((a) => a.name);
    return `For: ${names.join(', ')}`;
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[700px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-8 shadow-xl focus:outline-none overflow-y-auto">
          <form
            onSubmit={formHandleSubmit(handleValidSubmit)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          >
            <Dialog.Title className="dialog-title">
              Create new Task
            </Dialog.Title>

            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="flex h-10 rounded-full overflow-hidden border border-gray-300">
                  <button
                    type="button"
                    onClick={() => handleModeChange(false)}
                    className={cn(
                      'px-6 transition-colors',
                      mode === 'OWN'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700'
                    )}
                  >
                    Own
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange(true)}
                    className={cn(
                      'px-6 transition-colors',
                      mode === 'GROUP'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700'
                    )}
                  >
                    Group
                  </button>
                </div>
              </div>

              <div
                className={cn(
                  'grid gap-4',
                  mode === 'GROUP' ? 'grid-cols-2' : 'grid-cols-1'
                )}
              >
                {mode === 'GROUP' && (
                  <select
                    className="form-field"
                    value={watchedGroup}
                    onChange={(e) => handleGroupChange(e.target.value)}
                  >
                    <option value="">Select group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                )}
                <Controller
                  name="board"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={cn(
                        'w-full px-3 py-2 rounded-lg transition-colors',
                        'border border-gray-300',
                        'focus:outline-none focus:ring-0',
                        'focus:border-gray-900 focus:border-2',
                        isSubmitted &&
                          errors.board &&
                          !field.value &&
                          'border-red-500'
                      )}
                      onChange={(e) => {
                        field.onChange(e);
                        handleBoardChange(e.target.value);
                      }}
                    >
                      <option value="">Select board</option>
                      {filteredBoards.map((board) => (
                        <option key={board.id} value={board.id}>
                          {board.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              {mode === 'GROUP' && watchedGroup && (
                <Combobox
                  value={selectedAssignees[0]?.id || ''}
                  onChange={(userId: string) => {
                    if (userId) {
                      handleAssigneeSelect({
                        id: userId,
                        name: userId,
                      });
                    } else {
                      setSelectedAssignees([]);
                    }
                  }}
                >
                  <div className="relative">
                    <Combobox.Button className="form-field h-[42px] w-full text-left flex items-center justify-between">
                      <div className="flex-1 min-w-0 flex items-center justify-between mr-2">
                        <span className="block truncate max-w-[calc(100%-60px)]">
                          {formatAssigneesDisplay(selectedAssignees)}
                        </span>
                        {selectedAssignees.length > 0 && (
                          <span className="text-gray-500 ml-2 flex-shrink-0">
                            ({selectedAssignees.length})
                          </span>
                        )}
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </Combobox.Button>
                    <Combobox.Options className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                      <Combobox.Option
                        value=""
                        className="px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-100"
                      >
                        For: Select assignee...
                      </Combobox.Option>
                      {groups
                        .find((g) => g.id === watchedGroup)
                        ?.members.map((userId) => (
                          <Combobox.Option
                            key={userId}
                            value={userId}
                            className={({ active }) =>
                              `px-4 py-2 cursor-pointer ${
                                active ? 'bg-gray-100' : ''
                              }`
                            }
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                                {userId.charAt(0).toUpperCase()}
                              </div>
                              <span>{userId}</span>
                            </div>
                          </Combobox.Option>
                        ))}
                    </Combobox.Options>
                  </div>
                </Combobox>
              )}

              <Controller
                name="title"
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg transition-colors h-10',
                      'border border-gray-300',
                      'focus:outline-none focus:ring-0',
                      'focus:border-gray-900 focus:border-2',
                      isSubmitted &&
                        errors.title &&
                        !field.value &&
                        'border-red-500'
                    )}
                    placeholder="Task title"
                    autoFocus={false}
                  />
                )}
              />

              <textarea
                {...register('description')}
                className="w-full p-3 border rounded-lg text-sm resize-none overflow-y-auto"
                placeholder="Description"
                rows={4}
                style={{ maxHeight: '150px' }}
              />

              <div className="space-y-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'form-field w-full justify-start text-left font-normal h-[42px]',
                        !dueDate && 'text-gray-500'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : 'Select due date...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate || undefined}
                      onSelect={(date: Date | undefined) =>
                        setDueDate(date || null)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-4">
                {checklists.map((checklist, index) => (
                  <div
                    key={checklist.id}
                    className="space-y-2 bg-white rounded-lg shadow-sm p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-4">
                      {checklist.isEditing ? (
                        <div className="flex-1">
                          <input
                            id={`checklist-name-${checklist.id}`}
                            type="text"
                            value={checklist.name}
                            onChange={(e) => {
                              setChecklists(
                                checklists.map((list) =>
                                  list.id === checklist.id
                                    ? { ...list, name: e.target.value }
                                    : list
                                )
                              );
                            }}
                            onBlur={() => {
                              if (checklist.name.trim()) {
                                const newChecklists = [...checklists];
                                newChecklists[index] = {
                                  ...newChecklists[index],
                                  isEditing: false,
                                  items: [
                                    ...newChecklists[index].items,
                                    {
                                      text: '',
                                      isCompleted: false,
                                      color: getRandomColor(),
                                    },
                                  ],
                                };
                                setChecklists(newChecklists);
                              } else {
                                setChecklists(
                                  checklists.filter(
                                    (l) => l.id !== checklist.id
                                  )
                                );
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
                      ) : (
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
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setChecklists(
                            checklists.filter((l) => l.id !== checklist.id)
                          )
                        }
                        className="text-red-500 hover:text-red-600 ml-4"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {!checklist.isEditing && (
                      <div className="space-y-3">
                        {checklist.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-center gap-3 group"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={item.isCompleted}
                                onChange={(e) => {
                                  const newItems = [...checklist.items];
                                  newItems[itemIndex] = {
                                    ...item,
                                    isCompleted: e.target.checked,
                                  };
                                  setChecklists(
                                    checklists.map((list) =>
                                      list.id === checklist.id
                                        ? { ...list, items: newItems }
                                        : list
                                    )
                                  );
                                }}
                                className="peer h-4 w-4 rounded border-2 appearance-none focus:ring-0 focus:ring-offset-0"
                                style={{ borderColor: item.color }}
                              />
                              <CheckIcon
                                className="absolute h-3 w-3 top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                                style={{ color: item.color }}
                              />
                            </div>
                            <input
                              type="text"
                              value={item.item || ''}
                              onChange={(e) => {
                                const newItems = [...checklist.items];
                                newItems[itemIndex] = {
                                  ...item,
                                  item: e.target.value,
                                };

                                if (
                                  itemIndex === checklist.items.length - 1 &&
                                  e.target.value.trim() !== ''
                                ) {
                                  newItems.push({
                                    item: '',
                                    isCompleted: false,
                                    color: getRandomColor(),
                                  });
                                }

                                setChecklists(
                                  checklists.map((list) =>
                                    list.id === checklist.id
                                      ? { ...list, items: newItems }
                                      : list
                                  )
                                );
                              }}
                              className="flex-1 px-0 py-1 text-sm bg-transparent border-b border-transparent hover:border-gray-100 focus:border-gray-900 focus:outline-none transition-colors"
                              placeholder="Add item"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = checklist.items.filter(
                                  (_, idx) => idx !== itemIndex
                                );
                                setChecklists(
                                  checklists.map((list) =>
                                    list.id === checklist.id
                                      ? { ...list, items: newItems }
                                      : list
                                  )
                                );
                              }}
                              className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
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
              <button
                type="submit"
                className="px-6 py-2.5 text-white bg-black rounded-full hover:bg-gray-800 transition-colors text-base font-medium"
              >
                Save
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
