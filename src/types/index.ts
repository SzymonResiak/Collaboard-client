export interface TaskDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  assignees: string[];
  dueDate: string;
  startedAt?: string;
  completedAt?: string;
  board: string;
  group?: string;
  checklists: Checklist[];
}

export interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
  isEditing: boolean;
}

export interface ChecklistItem {
  id: string;
  item: string;
  isCompleted: boolean;
  color: string;
}
