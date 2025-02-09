import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import {
  Cross2Icon,
  CheckboxIcon,
  CalendarIcon,
  ChevronDownIcon,
} from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

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
  text: string;
  isCompleted: boolean;
}

interface Checklist {
  name: string;
  items: ChecklistItem[];
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

export default function CreateTaskDialog({
  open,
  onClose,
  boards,
  groups,
  onTaskCreate,
}: CreateTaskDialogProps) {
  const [mode, setMode] = useState<'OWN' | 'GROUP'>('OWN');
  const { control, watch, setValue, reset, register, getValues } =
    useForm<FormData>({
      defaultValues: {
        title: '',
        description: '',
        status: '',
        board: '',
        assignees: [],
        checklists: [],
      },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = getValues();
    console.log('Sending task data:', formData);

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
          checklists: formData.checklists
            .filter((checklist) => checklist.name && checklist.items.length > 0)
            .map((checklist) => ({
              name: checklist.name,
              items: checklist.items
                .filter((item) => item.text.trim() !== '')
                .map((item) => ({
                  text: item.text,
                  isCompleted: item.isCompleted,
                })),
            })),
        }),
      });

      const data = await response.json();
      console.log('Response:', data);

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

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[700px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-8 shadow-xl focus:outline-none overflow-y-auto">
          <form onSubmit={handleSubmit}>
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
                        ? 'bg-blue-600 text-white'
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
                        ? 'bg-blue-600 text-white'
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
                <select
                  className="form-field"
                  value={watchedBoard}
                  onChange={(e) => handleBoardChange(e.target.value)}
                >
                  <option value="">Select board</option>
                  {filteredBoards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
              </div>

              {mode === 'GROUP' && watchedGroup && (
                <Controller
                  name="assignees"
                  control={control}
                  render={({ field }) => {
                    const currentGroup = groups.find(
                      (g) => g.id === watchedGroup
                    );
                    const groupUsers = currentGroup?.members || [];

                    return (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsAssigneesOpen(!isAssigneesOpen)}
                          className="form-field flex items-center gap-2 pr-3"
                        >
                          <span className="text-gray-700 truncate flex-1 text-left">
                            {field.value?.length
                              ? field.value.join(', ')
                              : 'Choose assignees'}
                          </span>
                          <span className="text-gray-500 ml-2 flex-shrink-0">
                            {field.value?.length > 0 &&
                              `(${field.value.length})`}
                          </span>
                          <ChevronDownIcon
                            className={cn(
                              'h-4 w-4 transition-transform',
                              isAssigneesOpen && 'transform rotate-180'
                            )}
                          />
                        </button>

                        {isAssigneesOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                            {groupUsers.map((userId) => (
                              <label
                                key={userId}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={field.value?.includes(userId)}
                                  onChange={(e) => {
                                    const newValue = e.target.checked
                                      ? [...(field.value || []), userId]
                                      : field.value?.filter(
                                          (id) => id !== userId
                                        ) || [];
                                    field.onChange(newValue);
                                  }}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <span>{userId}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
              )}

              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    className="form-field h-10 w-full"
                    placeholder="Task title"
                    required
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

              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => {
                  const [inputValue, setInputValue] = useState(
                    field.value
                      ? format(new Date(field.value), 'dd/MM/yyyy')
                      : ''
                  );

                  useEffect(() => {
                    setInputValue(
                      field.value
                        ? format(new Date(field.value), 'dd/MM/yyyy')
                        : ''
                    );
                  }, [field.value]);

                  const validateAndUpdateDate = () => {
                    if (!inputValue) {
                      field.onChange(null);
                      return;
                    }

                    const [day, month, year] = inputValue
                      .split('/')
                      .map(Number);

                    if (!day || !month || !year) {
                      setInputValue('');
                      field.onChange(null);
                      return;
                    }

                    const date = new Date(year, month - 1, day, 12);

                    if (
                      date.getDate() === day &&
                      date.getMonth() === month - 1 &&
                      date.getFullYear() === year
                    ) {
                      field.onChange(date.toISOString());
                    } else {
                      setInputValue('');
                      field.onChange(null);
                    }
                  };

                  return (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            validateAndUpdateDate();
                          }
                        }}
                        onBlur={validateAndUpdateDate}
                        className="form-field"
                        placeholder="DD/MM/YYYY"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="p-3">
                            <CalendarIcon className="h-5 w-5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(date?.toISOString())
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  );
                }}
              />

              <div className="border-t my-6" />

              <div className="bg-gray-50 rounded-xl p-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    appendChecklist({
                      name: '',
                      items: [{ text: '', isCompleted: false }],
                    })
                  }
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <CheckboxIcon className="h-5 w-5 text-gray-700" />
                </Button>

                <div className="space-y-4 mt-4">
                  {checklistFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <Controller
                          name={`checklists.${index}.name`}
                          control={control}
                          render={({ field }) => (
                            <div className="relative flex-1 mr-4">
                              <input
                                {...field}
                                className="w-full px-0 py-2 text-lg font-medium bg-transparent border-b-2 border-gray-100 focus:border-gray-900 focus:outline-none transition-colors"
                                placeholder="Checklist name"
                              />
                            </div>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeChecklist(index)}
                          className="p-2 text-gray-900 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
                        >
                          <Cross2Icon className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="space-y-3 pl-2">
                        <Controller
                          name={`checklists.${index}.items`}
                          control={control}
                          render={({ field }) => (
                            <>
                              {field.value?.map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="flex items-center gap-4 group"
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.isCompleted}
                                    onChange={(e) => {
                                      const newItems = [...field.value];
                                      newItems[itemIndex] = {
                                        ...item,
                                        isCompleted: e.target.checked,
                                      };
                                      field.onChange(newItems);
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                  />
                                  <input
                                    type="text"
                                    value={item.text}
                                    onChange={(e) => {
                                      const newItems = [...field.value];
                                      newItems[itemIndex] = {
                                        ...item,
                                        text: e.target.value,
                                      };
                                      field.onChange(newItems);

                                      if (
                                        itemIndex === field.value.length - 1 &&
                                        e.target.value.trim() !== ''
                                      ) {
                                        field.onChange([
                                          ...newItems,
                                          { text: '', isCompleted: false },
                                        ]);
                                      }
                                    }}
                                    className="flex-1 px-0 py-2 text-sm bg-transparent border-b border-transparent group-hover:border-gray-100 focus:border-gray-900 focus:outline-none transition-colors"
                                    placeholder="Add item"
                                  />
                                </div>
                              ))}
                            </>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
