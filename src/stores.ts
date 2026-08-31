import { create } from 'zustand';
import * as db from './db';
import type {
  Habit,
  HabitLog,
  Idea,
  IdeaStatus,
  Project,
  ProjectRow,
  ProjectStatus,
  Task,
} from './types';

/* ------------------------------ Ideas ------------------------------ */

interface IdeasState {
  items: Idea[];
  load: () => void;
  add: (input: { title: string; description: string; tags: string; status: IdeaStatus }) => void;
  update: (id: number, patch: Partial<Pick<Idea, 'title' | 'description' | 'tags' | 'status'>>) => void;
  remove: (id: number) => void;
}

export const useIdeas = create<IdeasState>()((set) => ({
  items: [],
  load: () => set({ items: db.fetchIdeas() }),
  add: (input) => {
    db.insertIdea(input);
    set({ items: db.fetchIdeas() });
  },
  update: (id, patch) => {
    db.updateIdea(id, patch);
    set({ items: db.fetchIdeas() });
  },
  remove: (id) => {
    db.deleteIdea(id);
    set({ items: db.fetchIdeas() });
  },
}));

/* ----------------------------- Projects ---------------------------- */

interface ProjectsState {
  items: ProjectRow[];
  load: () => void;
  add: (input: { title: string; description: string; deadline: string | null; status: ProjectStatus }) => void;
  update: (
    id: number,
    patch: Partial<Pick<Project, 'title' | 'description' | 'deadline' | 'status'>>,
  ) => void;
  remove: (id: number) => void;
  addTask: (projectId: number, title: string) => void;
  toggleTask: (taskId: number, done: number) => void;
  removeTask: (taskId: number) => void;
}

export const useProjects = create<ProjectsState>()((set) => ({
  items: [],
  load: () => set({ items: db.fetchProjects() }),
  add: (input) => {
    db.insertProject(input);
    set({ items: db.fetchProjects() });
  },
  update: (id, patch) => {
    db.updateProject(id, patch);
    set({ items: db.fetchProjects() });
  },
  remove: (id) => {
    db.deleteProject(id);
    set({ items: db.fetchProjects() });
  },
  addTask: (projectId, title) => {
    db.addProjectTask(projectId, title);
    set({ items: db.fetchProjects() });
  },
  toggleTask: (taskId, done) => {
    db.toggleProjectTask(taskId, done);
    set({ items: db.fetchProjects() });
  },
  removeTask: (taskId) => {
    db.deleteProjectTask(taskId);
    set({ items: db.fetchProjects() });
  },
}));

/* ------------------------------ Habits ----------------------------- */

interface HabitsState {
  habits: Habit[];
  logs: HabitLog[];
  load: () => void;
  add: (input: { title: string; icon: string; color: string }) => void;
  update: (id: number, patch: Partial<Pick<Habit, 'title' | 'icon' | 'color'>>) => void;
  remove: (id: number) => void;
  toggleLog: (habitId: number, date: string) => void;
}

export const useHabits = create<HabitsState>()((set) => ({
  habits: [],
  logs: [],
  load: () => set({ habits: db.fetchHabits(), logs: db.fetchHabitLogs() }),
  add: (input) => {
    db.insertHabit(input);
    set({ habits: db.fetchHabits(), logs: db.fetchHabitLogs() });
  },
  update: (id, patch) => {
    db.updateHabit(id, patch);
    set({ habits: db.fetchHabits() });
  },
  remove: (id) => {
    db.deleteHabit(id);
    set({ habits: db.fetchHabits(), logs: db.fetchHabitLogs() });
  },
  toggleLog: (habitId, date) => {
    const existing = db.fetchHabitLogs().find((l) => l.habit_id === habitId && l.date === date);
    const done = existing ? (existing.done ? 0 : 1) : 1;
    db.setHabitLog(habitId, date, done);
    set({ logs: db.fetchHabitLogs() });
  },
}));

/* ------------------------------ Tasks ------------------------------ */

interface TasksState {
  tasks: Task[];
  load: () => void;
  add: (input: {
    title: string;
    description: string;
    date: string;
    time: string | null;
    repeat: Task['repeat'];
    priority: Task['priority'];
  }) => void;
  update: (
    id: number,
    patch: Partial<Pick<Task, 'title' | 'description' | 'date' | 'time' | 'repeat' | 'priority'>>,
  ) => void;
  toggle: (id: number) => void;
  remove: (id: number) => void;
}

export const useTasks = create<TasksState>()((set) => ({
  tasks: [],
  load: () => set({ tasks: db.fetchTasks() }),
  add: (input) => {
    db.insertTask(input);
    set({ tasks: db.fetchTasks() });
  },
  update: (id, patch) => {
    db.updateTask(id, patch);
    set({ tasks: db.fetchTasks() });
  },
  toggle: (id) => {
    const row = db.fetchTasks().find((t) => t.id === id);
    if (!row) return;
    db.setTaskDone(id, row.done ? 0 : 1);
    set({ tasks: db.fetchTasks() });
  },
  remove: (id) => {
    db.deleteTask(id);
    set({ tasks: db.fetchTasks() });
  },
}));
