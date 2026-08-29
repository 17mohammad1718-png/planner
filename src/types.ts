export type IdeaStatus = 'raw' | 'review' | 'started' | 'archived';

export interface Idea {
  id: number;
  title: string;
  description: string;
  tags: string;
  status: IdeaStatus;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'active' | 'paused' | 'done';

export interface Project {
  id: number;
  title: string;
  description: string;
  deadline: string | null;
  status: ProjectStatus;
  created_at: string;
}

export interface ProjectTask {
  id: number;
  project_id: number;
  title: string;
  done: number;
  created_at: string;
}

export interface ProjectRow extends Project {
  tasks: ProjectTask[];
}

export interface Habit {
  id: number;
  title: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface HabitLog {
  id: number;
  habit_id: number;
  date: string;
  done: number;
}

export type RepeatMode = 'none' | 'daily' | 'weekly';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string | null;
  repeat: RepeatMode;
  priority: Priority;
  done: number;
  created_at: string;
}

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  raw: 'خام',
  review: 'در بررسی',
  started: 'شروع شده',
  archived: 'آرشیو',
};

export const IDEA_STATUS_ORDER: IdeaStatus[] = ['raw', 'review', 'started', 'archived'];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'پایین',
  medium: 'متوسط',
  high: 'بالا',
};

export const REPEAT_LABELS: Record<RepeatMode, string> = {
  none: 'بدون تکرار',
  daily: 'روزانه',
  weekly: 'هفتگی',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'فعال',
  paused: 'موقتی',
  done: 'تمام',
};
