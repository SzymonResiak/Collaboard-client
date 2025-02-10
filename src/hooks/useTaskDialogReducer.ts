import { Reducer } from 'react';
import { TaskDetails, Checklist, ChecklistItem } from '@/types';

interface TaskDialogState {
  title: string;
  description: string;
  status: string;
  assignees: string[];
  dueDate: string | null;
  checklists: Checklist[];
}

type Action =
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_STATUS'; payload: string }
  | { type: 'SET_ASSIGNEES'; payload: string[] }
  | { type: 'SET_DUE_DATE'; payload: string | null }
  | { type: 'ADD_CHECKLIST'; payload: Checklist }
  | {
      type: 'UPDATE_CHECKLIST';
      payload: { index: number; checklist: Checklist };
    }
  | { type: 'REMOVE_CHECKLIST'; payload: number };

export const taskDialogReducer: Reducer<TaskDialogState, Action> = (
  state,
  action
) => {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_ASSIGNEES':
      return { ...state, assignees: action.payload };
    case 'SET_DUE_DATE':
      return { ...state, dueDate: action.payload };
    case 'ADD_CHECKLIST':
      return { ...state, checklists: [...state.checklists, action.payload] };
    case 'UPDATE_CHECKLIST':
      const updatedChecklists = [...state.checklists];
      updatedChecklists[action.payload.index] = action.payload.checklist;
      return { ...state, checklists: updatedChecklists };
    case 'REMOVE_CHECKLIST':
      return {
        ...state,
        checklists: state.checklists.filter((_, idx) => idx !== action.payload),
      };
    default:
      return state;
  }
};
