import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AssigneesSelectProps {
  assignees: string[];
  boardMembers: string[];
  onChange: (assignees: string[]) => void;
}

export default function AssigneesSelect({
  assignees,
  boardMembers,
  onChange,
}: AssigneesSelectProps) {
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);

  const handleAssigneeSelect = (value: string | null) => {
    setSelectedAssignee(value);
    if (value) {
      if (assignees.includes(value)) {
        onChange(assignees.filter((a) => a !== value));
      } else {
        onChange([...assignees, value]);
      }
    }
  };

  const formatAssigneesDisplay = (assignees: string[]) => {
    if (assignees.length === 0) return 'Select assignee...';
    return `For: ${assignees.join(', ')}`;
  };

  return (
    <Combobox
      value={selectedAssignee}
      onChange={handleAssigneeSelect}
      as="div"
      className="relative"
    >
      <Combobox.Button className="w-full flex items-center justify-between px-3 py-2 text-left border rounded-lg h-[42px]">
        <div className="flex-1 min-w-0 flex items-center justify-between mr-2">
          <span className="block truncate max-w-[calc(100%-60px)]">
            {formatAssigneesDisplay(assignees)}
          </span>
          {assignees.length > 0 && (
            <span className="text-gray-500 ml-2 flex-shrink-0">
              ({assignees.length})
            </span>
          )}
        </div>
        <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </Combobox.Button>

      <Combobox.Options className="absolute z-10 w-full mt-1 overflow-auto bg-white rounded-md shadow-lg max-h-60">
        <Combobox.Option
          value={null}
          className={({ active }) =>
            `cursor-default select-none relative py-2 px-4 ${
              active ? 'text-white bg-blue-600' : 'text-gray-500'
            }`
          }
        >
          Select assignee...
        </Combobox.Option>
        {boardMembers?.map((member) => (
          <Combobox.Option
            key={member}
            value={member}
            className={({ active }) =>
              `cursor-default select-none relative py-2 px-4 ${
                active
                  ? 'text-white bg-blue-600'
                  : assignees.includes(member)
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-900'
              }`
            }
          >
            {({ active }) => (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                  {member.charAt(0).toUpperCase()}
                </div>
                <span
                  className={
                    assignees.includes(member) ? 'font-semibold' : 'font-normal'
                  }
                >
                  {member}
                </span>
                {assignees.includes(member) && (
                  <CheckIcon className="h-4 w-4 ml-auto" />
                )}
              </div>
            )}
          </Combobox.Option>
        ))}
      </Combobox.Options>
    </Combobox>
  );
}
