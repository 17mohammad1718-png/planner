import { SQLiteDatabase } from 'expo-sqlite';
import { addDaysISO, todayISO } from './jalali';

/**
 * Sample data, inserted only on the very first launch (empty DB)
 * so the app doesn't open on empty screens.
 */
export function seedIfEmpty(db: SQLiteDatabase): void {
  const count = db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM ideas');
  if (count && count.n > 0) return;

  const t = todayISO();
  const day = (offset: number) => addDaysISO(t, offset);

  // Ideas
  db.runSync(
    'INSERT INTO ideas (title, description, tags, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    'اپ یادداشت صوتی',
    'دفترچه‌ای برای ثبت سریع ایده‌ها به‌صورت صوتی با تبدیل به متن',
    'اندروید,اپ',
    'review',
    day(-12),
    day(-12),
  );
  db.runSync(
    'INSERT INTO ideas (title, description, tags, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    'کانال یوتیوب تکنولوژی',
    'معرفی اپ‌های جدید با تست واقعی و مقایسه',
    'محتوا',
    'raw',
    day(-5),
    day(-5),
  );
  db.runSync(
    'INSERT INTO ideas (title, description, tags, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    'وب‌سایت شخصی',
    'پورتفولیو + بلاگ شخصی برای نمایش پروژه‌ها',
    'وب,پورتفولیو',
    'started',
    day(-2),
    day(-1),
  );

  // Projects
  const p1 = db
    .runSync(
      'INSERT INTO projects (title, description, deadline, status, created_at) VALUES (?, ?, ?, ?, ?)',
      'توسعه اپ Planner',
      'ساخت کامل اپ اندروید: ایده، پروژه، عادت، کار روزانه و تقویم شمسی/میلادی',
      day(14),
      'active',
      day(-20),
    )
    .lastInsertRowId;
  for (const [title, done] of [
    ['اسکافولد پروژه Expo', 1],
    ['مدل داده SQLite', 1],
    ['صفحه تقویم شمسی', 0],
    ['صفحه تسک‌ها', 0],
    ['بیلد APK', 0],
  ] as const) {
    db.runSync(
      'INSERT INTO project_tasks (project_id, title, done, created_at) VALUES (?, ?, ?, ?)',
      p1,
      title,
      done,
      t,
    );
  }

  const p2 = db
    .runSync(
      'INSERT INTO projects (title, description, deadline, status, created_at) VALUES (?, ?, ?, ?, ?)',
      'بازطراحی سایت استارتاپ',
      'جدیدسازی ظاهر و صفحات اصلی سایت',
      day(-3),
      'active',
      day(-10),
    )
    .lastInsertRowId;
  for (const [title, done] of [
    ['تحلیل سایت فعلی', 1],
    ['طراحی صفحات جدید', 0],
  ] as const) {
    db.runSync(
      'INSERT INTO project_tasks (project_id, title, done, created_at) VALUES (?, ?, ?, ?)',
      p2,
      title,
      done,
      t,
    );
  }

  db.runSync(
    'INSERT INTO projects (title, description, deadline, status, created_at) VALUES (?, ?, ?, ?, ?)',
    'آموزش React Native',
    'یادگیری عمیق RN با ساخت اپ نمونه',
    null,
    'paused',
    day(-30),
  );

  // Habits
  const h1 = db
    .runSync('INSERT INTO habits (title, icon, color, created_at) VALUES (?, ?, ?, ?)', 'ورزش', '💪', '#4f46e5', day(-30))
    .lastInsertRowId;
  const h2 = db
    .runSync('INSERT INTO habits (title, icon, color, created_at) VALUES (?, ?, ?, ?)', 'مطالعه', '📚', '#f59e0b', day(-30))
    .lastInsertRowId;
  const h3 = db
    .runSync('INSERT INTO habits (title, icon, color, created_at) VALUES (?, ?, ?, ?)', 'مدیتیشن', '🧘', '#10b981', day(-30))
    .lastInsertRowId;

  for (let i = 1; i <= 4; i += 1) {
    db.runSync('INSERT OR REPLACE INTO habit_logs (habit_id, date, done) VALUES (?, ?, 1)', h1, day(-i));
  }
  for (let i = 1; i <= 5; i += 1) {
    db.runSync('INSERT OR REPLACE INTO habit_logs (habit_id, date, done) VALUES (?, ?, 1)', h2, day(-i));
  }
  for (let i = 1; i <= 2; i += 1) {
    db.runSync('INSERT OR REPLACE INTO habit_logs (habit_id, date, done) VALUES (?, ?, 1)', h3, day(-i));
  }

  // Tasks
  const tasks: Array<[string, string, string, string | null, string, string, number]> = [
    ['چک کردن ایمیل‌ها', '', t, '09:00', 'none', 'low', 1],
    ['جلسه هماهنگی تیم', 'بازبینی پیشرفت هفته', t, '10:00', 'none', 'high', 0],
    ['بازگشت کتاب کتابخانه', '', t, '18:00', 'none', 'medium', 0],
    ['ورزش', '', t, '20:00', 'daily', 'medium', 0],
    ['ارائه به مشتری', 'ارائه هفتگی پیشرفت', day(1), '14:00', 'weekly', 'high', 0],
    ['پرداخت قبض برق', '', day(3), null, 'none', 'medium', 0],
    ['خرید وسایل آشپزخانه', 'فهرست را از یادداشت بردار', day(5), null, 'none', 'low', 0],
  ];
  for (const [title, desc, date, time, repeat, priority, done] of tasks) {
    db.runSync(
      'INSERT INTO tasks (title, description, date, time, repeat, priority, done, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      title,
      desc,
      date,
      time,
      repeat,
      priority,
      done,
      t,
    );
  }
}
