import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CalendarGrid, type DayDots } from '../components/CalendarGrid';
import { Card, CheckCircle, ScreenHeader } from '../components/ui';
import {
  formatGregorian,
  formatISOJalali,
  formatJalali,
  gregorianMonthCells,
  gregorianMonthTitle,
  jalaliMonthCells,
  jalaliMonthTitle,
  parseISO,
  toFa,
  toISO,
  gregorianOf,
  toJalali,
  toJalaliDate,
  taskShowsOn,
  todayISO,
} from '../lib/jalali';
import { useHabits, useProjects, useTasks } from '../stores';

type Mode = 'jalali' | 'gregorian';

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center">
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <Text className="ps-1 text-xs text-slate-500">{label}</Text>
    </View>
  );
}

export function CalendarScreen() {
  const tasks = useTasks((s) => s.tasks);
  const habits = useHabits((s) => s.habits);
  const logs = useHabits((s) => s.logs);
  const projects = useProjects((s) => s.items);

  const [mode, setMode] = useState<Mode>('jalali');
  const [jalaliView, setJalaliView] = useState(() => {
    const j = toJalaliDate(new Date());
    return { y: j.jy, m: j.jm };
  });
  const [gregView, setGregView] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() + 1 };
  });
  const [selectedKey, setSelectedKey] = useState(todayISO());

  useFocusEffect(
    useCallback(() => {
      useTasks.getState().load();
      useHabits.getState().load();
      useProjects.getState().load();
    }, []),
  );

  const t = todayISO();
  const view = mode === 'jalali' ? jalaliView : gregView;
  const setView = mode === 'jalali' ? setJalaliView : setGregView;

  const cells = mode === 'jalali' ? jalaliMonthCells(view.y, view.m) : gregorianMonthCells(view.y, view.m);
  const monthKeys = cells
    .filter((c): c is number => c != null)
    .map((d) =>
      mode === 'jalali'
        ? toISO(gregorianOf({ jy: view.y, jm: view.m, jd: d }))
        : `${view.y}-${String(view.m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    );

  const habitDays = new Set(logs.filter((l) => l.done === 1).map((l) => l.date));
  const deadlineDays = new Set(projects.filter((p) => p.status !== 'done' && p.deadline).map((p) => p.deadline!));
  const openTasks = tasks.filter((x) => x.done !== 1);
  const dots: Record<string, DayDots> = {};
  for (const k of monthKeys) {
    const info: DayDots = {};
    if (openTasks.some((x) => taskShowsOn(x, k))) info.task = true;
    if (habitDays.has(k)) info.habit = true;
    if (deadlineDays.has(k)) info.deadline = true;
    if (info.task || info.habit || info.deadline) dots[k] = info;
  }

  const title = mode === 'jalali' ? jalaliMonthTitle(view.y, view.m) : gregorianMonthTitle(view.y, view.m);

  const shift = (dir: number) => {
    let m = view.m + dir;
    let y = view.y;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setView({ y, m });
  };

  const dayTasks = tasks.filter((x) => taskShowsOn(x, selectedKey) || (x.date === selectedKey && x.done === 1));
  const dayProjects = projects.filter((p) => p.deadline === selectedKey);
  const selJalali = toJalali(parseISO(selectedKey).gy, parseISO(selectedKey).gm, parseISO(selectedKey).gd);

  return (
    <View className="flex-1 bg-slate-50">
      <ScreenHeader title="تقویم" />
      <View className="px-5">
        <View className="flex-row rounded-full bg-white p-1 shadow-sm">
          {(['jalali', 'gregorian'] as Mode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              className={`flex-1 items-center rounded-full py-1.5 ${mode === m ? 'bg-indigo-600' : ''}`}
            >
              <Text className={`text-sm font-bold ${mode === m ? 'text-white' : 'text-slate-500'}`}>
                {m === 'jalali' ? 'شمسی' : 'میلادی'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <Pressable onPress={() => shift(-1)} className="rounded-full bg-white p-2 shadow-sm">
            <Ionicons name="chevron-forward" size={20} color="#475569" />
          </Pressable>
          <Text className="text-base font-bold text-slate-900">{title}</Text>
          <Pressable onPress={() => shift(1)} className="rounded-full bg-white p-2 shadow-sm">
            <Ionicons name="chevron-back" size={20} color="#475569" />
          </Pressable>
        </View>

        <View className="mt-2">
          <CalendarGrid
            type={mode}
            year={view.y}
            month={view.m}
            todayKey={t}
            selectedKey={selectedKey}
            dots={dots}
            onDayPress={setSelectedKey}
          />
        </View>

        <View className="mt-2 flex-row items-center justify-center gap-4">
          <LegendDot color="#6366f1" label="کاری" />
          <LegendDot color="#10b981" label="عادت" />
          <LegendDot color="#f59e0b" label="ددلاین" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Text className="font-bold text-slate-900">{formatJalali(selJalali, true)}</Text>
          <Text className="mt-0.5 text-xs text-slate-400">{formatGregorian(parseISO(selectedKey))}</Text>

          {dayProjects.length > 0 ? (
            <View className="mt-3">
              {dayProjects.map((p) => (
                <View key={p.id} className="mb-2 flex-row items-center rounded-xl bg-amber-50 px-3 py-2">
                  <Text className="text-sm">⏰</Text>
                  <Text className="flex-1 px-2 text-sm font-semibold text-amber-700">
                    ددلاین: {p.title}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <Text className="mt-3 font-bold text-slate-800">کارها ({toFa(dayTasks.length)})</Text>
          {dayTasks.length === 0 ? (
            <Text className="mt-1 text-sm text-slate-400">کاری ثبت نشده ✅</Text>
          ) : (
            dayTasks.map((x) => (
              <View key={x.id} className="mt-2 flex-row items-center">
                <CheckCircle checked={x.done === 1} size={22} onPress={() => useTasks.getState().toggle(x.id)} />
                <Text className={`flex-1 px-2 text-sm ${x.done === 1 ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {x.title}
                  {x.time ? ` • ${toFa(x.time)}` : ''}
                </Text>
              </View>
            ))
          )}

          <Text className="mt-4 font-bold text-slate-800">عادت‌ها</Text>
          {habits.length === 0 ? (
            <Text className="mt-1 text-sm text-slate-400">عادی ثبت نشده</Text>
          ) : (
            habits.map((h) => (
              <View key={h.id} className="mt-2 flex-row items-center">
                <CheckCircle
                  checked={logs.some((l) => l.habit_id === h.id && l.date === selectedKey && l.done === 1)}
                  size={22}
                  color={h.color}
                  onPress={() => useHabits.getState().toggleLog(h.id, selectedKey)}
                />
                <Text className="px-2 text-sm text-slate-700">
                  {h.icon} {h.title}
                </Text>
              </View>
            ))
          )}

          {selectedKey !== t ? (
            <Pressable onPress={() => setSelectedKey(t)} className="mt-4 items-center">
              <Text className="text-sm font-semibold text-indigo-600">بازگشت به امروز</Text>
            </Pressable>
          ) : null}
        </Card>
      </ScrollView>
    </View>
  );
}
