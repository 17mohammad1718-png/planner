import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CalendarGrid } from '../components/CalendarGrid';
import type { RootStackParamList } from '../components/BottomTabs';
import { Card, CheckCircle, EmptyState, ProgressBar, ScreenHeader, SectionHeader } from '../components/ui';
import {
  addDaysISO,
  formatGregorian,
  formatISOJalali,
  formatJalali,
  gregorianOf,
  jalaliMonthCells,
  jalaliMonthTitle,
  toFa,
  toISO,
  toJalaliDate,
  taskShowsOn,
  todayISO,
} from '../lib/jalali';
import { IDEA_STATUS_LABELS } from '../types';
import { useHabits, useIdeas, useProjects, useTasks } from '../stores';

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const tasks = useTasks((s) => s.tasks);
  const habits = useHabits((s) => s.habits);
  const logs = useHabits((s) => s.logs);
  const projects = useProjects((s) => s.items);
  const ideas = useIdeas((s) => s.items);

  useFocusEffect(
    useCallback(() => {
      useTasks.getState().load();
      useHabits.getState().load();
      useProjects.getState().load();
      useIdeas.getState().load();
    }, []),
  );

  const t = todayISO();
  const todayTasks = tasks.filter((x) => taskShowsOn(x, t) || (x.date === t && x.done === 1));
  const doneCount = todayTasks.filter((x) => x.done === 1).length;
  const pct = todayTasks.length ? Math.round((doneCount / todayTasks.length) * 100) : 0;

  const upcoming = projects
    .filter((p) => p.status !== 'done' && p.deadline != null && p.deadline <= addDaysISO(t, 7))
    .sort((a, b) => ((a.deadline ?? '') < (b.deadline ?? '') ? -1 : 1));
  const recentIdeas = ideas.slice(0, 3);

  const habitToday = (id: number) => logs.find((l) => l.habit_id === id && l.date === t && l.done === 1);
  const streakOf = (id: number) => {
    const days = new Set(logs.filter((l) => l.habit_id === id && l.done === 1).map((l) => l.date));
    let s = 0;
    let cur = t;
    if (!days.has(cur)) cur = addDaysISO(cur, -1);
    while (days.has(cur)) {
      s += 1;
      cur = addDaysISO(cur, -1);
    }
    return s;
  };

  const now = new Date();
  const jToday = toJalaliDate(now);
  const dateLine = `${formatJalali(jToday, true)} • ${formatGregorian(gregorianOf(jToday))}`;

  // mini month preview (jalali, current month)
  const monthKeys = jalaliMonthCells(jToday.jy, jToday.jm)
    .filter((c): c is number => c != null)
    .map((d) => toISO(gregorianOf({ jy: jToday.jy, jm: jToday.jm, jd: d })));
  const openTasks = tasks.filter((x) => x.done !== 1);
  const habitDays = new Set(logs.filter((l) => l.done === 1).map((l) => l.date));
  const deadlineDays = new Set(projects.filter((p) => p.status !== 'done' && p.deadline).map((p) => p.deadline!));
  const miniDots: Record<string, { task?: boolean; habit?: boolean; deadline?: boolean }> = {};
  for (const k of monthKeys) {
    const info: { task?: boolean; habit?: boolean; deadline?: boolean } = {};
    if (openTasks.some((x) => taskShowsOn(x, k))) info.task = true;
    if (habitDays.has(k)) info.habit = true;
    if (deadlineDays.has(k)) info.deadline = true;
    if (info.task || info.habit || info.deadline) miniDots[k] = info;
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScreenHeader title="سلام 👋" subtitle={dateLine} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Card className="mt-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-bold text-slate-800">کارهای امروز</Text>
            <Text className="text-sm font-bold text-indigo-600">
              {toFa(doneCount)} از {toFa(todayTasks.length)}
            </Text>
          </View>
          <View className="mt-3">
            <ProgressBar value={pct} />
          </View>
          <Pressable
            onPress={() => navigation.navigate('Tasks')}
            className="mt-3 flex-row items-center justify-between rounded-xl bg-indigo-50 px-4 py-3"
          >
            <Text className="font-bold text-indigo-700">مشاهده همه کارها</Text>
            <Ionicons name="chevron-forward" size={18} color="#4338ca" />
          </Pressable>
        </Card>

        <Card className="mt-4">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="font-bold text-slate-800">{jalaliMonthTitle(jToday.jy, jToday.jm)}</Text>
            <Text className="text-xs text-slate-400">{toFa(Object.keys(miniDots).length)} روز با فعالیت</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Tabs', { screen: 'Calendar' })}>
            <CalendarGrid
              type="jalali"
              year={jToday.jy}
              month={jToday.jm}
              todayKey={t}
              selectedKey={null}
              dots={miniDots}
              compact
            />
          </Pressable>
        </Card>

        <SectionHeader title="عادت‌های امروز" right="همه" onRight={() => navigation.navigate('Tabs', { screen: 'Habits' })} />
        {habits.length === 0 ? (
          <EmptyState emoji="🌱" title="هنوز عادی ثبت نکرده‌ای" />
        ) : (
          <Card>
            {habits.map((h, i) => (
              <View
                key={h.id}
                className={`flex-row items-center ${i > 0 ? 'mt-3 border-t border-slate-100 pt-3' : ''}`}
              >
                <Text className="text-2xl">{h.icon}</Text>
                <View className="flex-1 px-3">
                  <Text className="font-semibold text-slate-800">{h.title}</Text>
                  {streakOf(h.id) > 0 ? (
                    <Text className="text-xs text-slate-400">🔥 {toFa(streakOf(h.id))} روز متوالی</Text>
                  ) : null}
                </View>
                <CheckCircle checked={!!habitToday(h.id)} onPress={() => useHabits.getState().toggleLog(h.id, t)} color={h.color} />
              </View>
            ))}
          </Card>
        )}

        {upcoming.length > 0 ? (
          <>
            <SectionHeader
              title="ددلاین‌های نزدیک"
              right="همه"
              onRight={() => navigation.navigate('Tabs', { screen: 'Projects' })}
            />
            <Card>
              {upcoming.map((p, i) => {
                const overdue = (p.deadline ?? '') < t;
                return (
                  <View
                    key={p.id}
                    className={`flex-row items-center justify-between ${i > 0 ? 'mt-3 border-t border-slate-100 pt-3' : ''}`}
                  >
                    <View className="flex-1 pe-3">
                      <Text className="font-semibold text-slate-800">{p.title}</Text>
                      <Text className={`text-xs ${overdue ? 'font-bold text-red-500' : 'text-slate-400'}`}>
                        {overdue ? '⚠️ دیر شده — ' : 'ددلاین: '}
                        {formatISOJalali(p.deadline!)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Card>
          </>
        ) : null}

        <SectionHeader title="ایده‌های اخیر" right="همه" onRight={() => navigation.navigate('Tabs', { screen: 'Ideas' })} />
        {recentIdeas.length === 0 ? (
          <EmptyState emoji="💡" title="هنوز ایده‌ای ثبت نکرده‌ای" />
        ) : (
          <Card>
            {recentIdeas.map((idea, i) => (
              <View key={idea.id} className={i > 0 ? 'mt-3 border-t border-slate-100 pt-3' : ''}>
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 font-semibold text-slate-800" numberOfLines={1}>
                    {idea.title}
                  </Text>
                  <View className="rounded-full bg-slate-100 px-2.5 py-0.5">
                    <Text className="text-xs font-bold text-slate-600">{IDEA_STATUS_LABELS[idea.status]}</Text>
                  </View>
                </View>
                {idea.description ? (
                  <Text className="mt-1 text-sm text-slate-400" numberOfLines={2}>
                    {idea.description}
                  </Text>
                ) : null}
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
