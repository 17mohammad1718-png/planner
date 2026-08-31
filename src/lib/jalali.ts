import { d2j, g2d, jalaaliMonthLength, toGregorian } from 'jalaali-js';

export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export interface GregorianDate {
  gy: number;
  gm: number;
  gd: number;
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export const toFa = (v: string | number): string =>
  String(v).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

export const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const GREGORIAN_MONTHS = [
  'ژانویه',
  'فوریه',
  'مارس',
  'آوریل',
  'مه',
  'ژوئن',
  'ژوئیه',
  'اوت',
  'سپتامبر',
  'اکتبر',
  'نوامبر',
  'دسامبر',
];

export const WEEKDAYS_FA = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
];

export const WEEKDAY_LETTERS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

const pad2 = (n: number): string => String(n).padStart(2, '0');

/**
 * Gregorian → Jalali.
 * Note: jalaali-js@2 has a broken `toJalali` export, so we compose the
 * low-level primitives (g2d + d2j) which are verified against ICU.
 */
export function toJalali(gy: number, gm: number, gd: number): JalaliDate {
  return d2j(g2d(gy, gm, gd));
}

export function toJalaliDate(date: Date): JalaliDate {
  return toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function gregorianOf(j: JalaliDate): GregorianDate {
  const g = toGregorian(j.jy, j.jm, j.jd);
  return { gy: g.gy, gm: g.gm, gd: g.gd };
}

export function toISO(g: GregorianDate): string {
  return `${g.gy}-${pad2(g.gm)}-${pad2(g.gd)}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseISO(iso: string): GregorianDate {
  const parts = iso.split('-').map(Number);
  return { gy: parts[0], gm: parts[1], gd: parts[2] };
}

export function addDaysISO(iso: string, days: number): string {
  const { gy, gm, gd } = parseISO(iso);
  const d = new Date(gy, gm - 1, gd + days);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Persian weekday index: 0 = Saturday … 6 = Friday */
export function saWeekday(iso: string): number {
  const { gy, gm, gd } = parseISO(iso);
  return (new Date(gy, gm - 1, gd).getDay() + 1) % 7;
}

export function formatJalali(j: JalaliDate, withWeekday = false): string {
  const base = `${toFa(j.jd)} ${JALALI_MONTHS[j.jm - 1]} ${toFa(j.jy)}`;
  if (!withWeekday) return base;
  const wd = WEEKDAYS_FA[saWeekday(toISO(gregorianOf(j)))];
  return `${wd} ${base}`;
}

export function formatGregorian(g: GregorianDate): string {
  return `${toFa(g.gd)} ${GREGORIAN_MONTHS[g.gm - 1]} ${toFa(g.gy)}`;
}

/** Jalali display of a stored ISO (Gregorian) date. */
export function formatISOJalali(iso: string): string {
  const { gy, gm, gd } = parseISO(iso);
  return formatJalali(toJalali(gy, gm, gd));
}

/** Days of a Jalali month, padded with nulls to complete Saturday-start rows. */
export function jalaliMonthCells(jy: number, jm: number): (number | null)[] {
  const lead = saWeekday(toISO(gregorianOf({ jy, jm, jd: 1 })));
  const days = jalaaliMonthLength(jy, jm);
  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let d = 1; d <= days; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Days of a Gregorian month, padded with nulls to complete Saturday-start rows. */
export function gregorianMonthCells(gy: number, gm: number): (number | null)[] {
  const lead = saWeekday(`${gy}-${pad2(gm)}-01`);
  const days = new Date(gy, gm, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let d = 1; d <= days; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function jalaliMonthTitle(jy: number, jm: number): string {
  return `${JALALI_MONTHS[jm - 1]} ${toFa(jy)}`;
}

export function gregorianMonthTitle(gy: number, gm: number): string {
  return `${GREGORIAN_MONTHS[gm - 1]} ${toFa(gy)}`;
}

/**
 * Does this (open) task appear on the given day?
 * - one-off: exactly on its date
 * - daily: from its date onward
 * - weekly: same weekday, from its date onward
 */
export function taskShowsOn(
  task: { date: string; repeat: string; done: number },
  dayISO: string,
): boolean {
  if (task.done || task.date > dayISO) return false;
  if (task.repeat === 'daily') return true;
  if (task.repeat === 'weekly') return saWeekday(task.date) === saWeekday(dayISO);
  return task.date === dayISO;
}
