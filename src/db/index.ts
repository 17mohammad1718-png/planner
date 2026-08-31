import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';
import { todayISO } from '../lib/jalali';
import { seedIfEmpty } from '../lib/seed';
import { SCHEMA_SQL } from './schema';
import type {
  Habit,
  HabitLog,
  Idea,
  IdeaStatus,
  Project,
  ProjectRow,
  ProjectStatus,
  ProjectTask,
  Priority,
  RepeatMode,
  Task,
} from '../types';

let db: SQLiteDatabase | null = null;

export function getDB(): SQLiteDatabase {
  if (!db) {
    db = openDatabaseSync('planner.db');
    db.execSync(SCHEMA_SQL);
    seedIfEmpty(db);
  }
  return db;
}

export function initDB(): void {
  getDB();
}

/* ------------------------------ Ideas ------------------------------ */

export function fetchIdeas(): Idea[] {
  return getDB().getAllSync<Idea>('SELECT * FROM ideas ORDER BY created_at DESC, id DESC');
}

export function insertIdea(input: {
  title: string;
  description: string;
  tags: string;
  status: IdeaStatus;
}): number {
  const d = todayISO();
  const res = getDB().runSync(
    'INSERT INTO ideas (title, description, tags, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    input.title,
    input.description,
    input.tags,
    input.status,
    d,
    d,
  );
  return res.lastInsertRowId;
}

export function updateIdea(
  id: number,
  patch: Partial<Pick<Idea, 'title' | 'description' | 'tags' | 'status'>>,
): void {
  const row = getDB().getFirstSync<Idea>('SELECT * FROM ideas WHERE id = ?', id);
  if (!row) return;
  const next = { ...row, ...patch, updated_at: todayISO() };
  getDB().runSync(
    'UPDATE ideas SET title = ?, description = ?, tags = ?, status = ?, updated_at = ? WHERE id = ?',
    next.title,
    next.description,
    next.tags,
    next.status,
    next.updated_at,
    id,
  );
}

export function deleteIdea(id: number): void {
  getDB().runSync('DELETE FROM ideas WHERE id = ?', id);
}

/* ----------------------------- Projects ---------------------------- */

export function fetchProjects(): ProjectRow[] {
  const d = getDB();
  const projects = d.getAllSync<Project>(
    'SELECT * FROM projects ORDER BY (deadline IS NULL) ASC, deadline ASC, id DESC',
  );
  const tasks = d.getAllSync<ProjectTask>(
    'SELECT * FROM project_tasks ORDER BY done ASC, id ASC',
  );
  return projects.map((p) => ({ ...p, tasks: tasks.filter((t) => t.project_id === p.id) }));
}

export function insertProject(input: {
  title: string;
  description: string;
  deadline: string | null;
  status: ProjectStatus;
}): number {
  const res = getDB().runSync(
    'INSERT INTO projects (title, description, deadline, status, created_at) VALUES (?, ?, ?, ?, ?)',
    input.title,
    input.description,
    input.deadline,
    input.status,
    todayISO(),
  );
  return res.lastInsertRowId;
}

export function updateProject(
  id: number,
  patch: Partial<Pick<Project, 'title' | 'description' | 'deadline' | 'status'>>,
): void {
  const row = getDB().getFirstSync<Project>('SELECT * FROM projects WHERE id = ?', id);
  if (!row) return;
  const next = { ...row, ...patch };
  getDB().runSync(
    'UPDATE projects SET title = ?, description = ?, deadline = ?, status = ? WHERE id = ?',
    next.title,
    next.description,
    next.deadline,
    next.status,
    id,
  );
}

export function deleteProject(id: number): void {
  const d = getDB();
  d.runSync('DELETE FROM project_tasks WHERE project_id = ?', id);
  d.runSync('DELETE FROM projects WHERE id = ?', id);
}

export function addProjectTask(projectId: number, title: string): number {
  const res = getDB().runSync(
    'INSERT INTO project_tasks (project_id, title, done, created_at) VALUES (?, ?, 0, ?)',
    projectId,
    title,
    todayISO(),
  );
  return res.lastInsertRowId;
}

export function toggleProjectTask(id: number, done: number): void {
  getDB().runSync('UPDATE project_tasks SET done = ? WHERE id = ?', done, id);
}

export function deleteProjectTask(id: number): void {
  getDB().runSync('DELETE FROM project_tasks WHERE id = ?', id);
}

/* ------------------------------ Habits ----------------------------- */

export function fetchHabits(): Habit[] {
  return getDB().getAllSync<Habit>('SELECT * FROM habits ORDER BY id ASC');
}

export function fetchHabitLogs(): HabitLog[] {
  return getDB().getAllSync<HabitLog>('SELECT * FROM habit_logs ORDER BY date DESC');
}

export function insertHabit(input: { title: string; icon: string; color: string }): number {
  const res = getDB().runSync(
    'INSERT INTO habits (title, icon, color, created_at) VALUES (?, ?, ?, ?)',
    input.title,
    input.icon,
    input.color,
    todayISO(),
  );
  return res.lastInsertRowId;
}

export function updateHabit(
  id: number,
  patch: Partial<Pick<Habit, 'title' | 'icon' | 'color'>>,
): void {
  const row = getDB().getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?', id);
  if (!row) return;
  const next = { ...row, ...patch };
  getDB().runSync(
    'UPDATE habits SET title = ?, icon = ?, color = ? WHERE id = ?',
    next.title,
    next.icon,
    next.color,
    id,
  );
}

export function deleteHabit(id: number): void {
  const d = getDB();
  d.runSync('DELETE FROM habit_logs WHERE habit_id = ?', id);
  d.runSync('DELETE FROM habits WHERE id = ?', id);
}

export function setHabitLog(habitId: number, date: string, done: number): void {
  getDB().runSync(
    'INSERT OR REPLACE INTO habit_logs (habit_id, date, done) VALUES (?, ?, ?)',
    habitId,
    date,
    done,
  );
}

/* ------------------------------ Tasks ------------------------------ */

export function fetchTasks(): Task[] {
  return getDB().getAllSync<Task>(
    'SELECT * FROM tasks ORDER BY date ASC, (time IS NULL) ASC, time ASC, id ASC',
  );
}

export function insertTask(input: {
  title: string;
  description: string;
  date: string;
  time: string | null;
  repeat: RepeatMode;
  priority: Priority;
}): number {
  const res = getDB().runSync(
    'INSERT INTO tasks (title, description, date, time, repeat, priority, done, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
    input.title,
    input.description,
    input.date,
    input.time,
    input.repeat,
    input.priority,
    todayISO(),
  );
  return res.lastInsertRowId;
}

export function updateTask(
  id: number,
  patch: Partial<Pick<Task, 'title' | 'description' | 'date' | 'time' | 'repeat' | 'priority'>>,
): void {
  const row = getDB().getFirstSync<Task>('SELECT * FROM tasks WHERE id = ?', id);
  if (!row) return;
  const next = { ...row, ...patch };
  getDB().runSync(
    'UPDATE tasks SET title = ?, description = ?, date = ?, time = ?, repeat = ?, priority = ? WHERE id = ?',
    next.title,
    next.description,
    next.date,
    next.time,
    next.repeat,
    next.priority,
    id,
  );
}

export function setTaskDone(id: number, done: number): void {
  getDB().runSync('UPDATE tasks SET done = ? WHERE id = ?', done, id);
}

export function deleteTask(id: number): void {
  getDB().runSync('DELETE FROM tasks WHERE id = ?', id);
}
