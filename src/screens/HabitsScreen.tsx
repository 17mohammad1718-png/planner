import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { HabitForm } from '../components/forms';
import { SheetModal } from '../components/SheetModal';
import { Card, CheckCircle, EmptyState, FabButton, ScreenHeader } from '../components/ui';
import { addDaysISO, toFa, todayISO } from '../lib/jalali';
import type { Habit } from '../types';
import { useHabits } from '../stores';

export function HabitsScreen() {
  const habits = useHabits((s) => s.habits);
  const logs = useHabits((s) => s.logs);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  useFocusEffect(
    useCallback(() => {
      useHabits.getState().load();
    }, []),
  );

  const t = todayISO();
  const last7 = Array.from({ length: 7 }, (_, i) => addDaysISO(t, i - 6));

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

  const isDone = (habitId: number, date: string) =>
    logs.some((l) => l.habit_id === habitId && l.date === date && l.done === 1);

  return (
    <View className="flex-1 bg-slate-50">
      <ScreenHeader title="عادت‌ها" subtitle="هر روز یه تیک، یه قدم جلوتر 🚀" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {habits.length === 0 ? (
          <EmptyState emoji="🌱" title="هنوز عادی نداری" hint="با دکمه پایین اولین عادتت رو بساز" />
        ) : (
          habits.map((h) => (
            <Card key={h.id} className="mb-3">
              <Pressable
                className="flex-row items-center"
                onPress={() => {
                  setEditing(h);
                  setFormOpen(true);
                }}
              >
                <Text className="text-3xl">{h.icon}</Text>
                <View className="flex-1 px-3">
                  <Text className="font-bold text-slate-800">{h.title}</Text>
                  <View className="mt-1.5 flex-row items-center">
                    {last7.map((d) => (
                      <View
                        key={d}
                        className="ms-1.5 h-3 w-3 rounded-full"
                        style={{ backgroundColor: isDone(h.id, d) ? h.color : '#e2e8f0' }}
                      />
                    ))}
                    <Text className="ps-2 text-xs text-slate-400">۷ روز اخیر</Text>
                  </View>
                </View>
                <View>
                  <Text className="mb-1 text-center text-xs text-slate-400">امروز</Text>
                  <CheckCircle
                    checked={isDone(h.id, t)}
                    onPress={() => useHabits.getState().toggleLog(h.id, t)}
                    color={h.color}
                  />
                </View>
              </Pressable>
              {streakOf(h.id) > 0 ? (
                <View className="mt-2 self-end rounded-full bg-orange-50 px-3 py-1">
                  <Text className="text-xs font-bold text-orange-600">🔥 {toFa(streakOf(h.id))} روز متوالی</Text>
                </View>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>

      <View className="flex-row justify-end px-5 pb-5 pt-1">
        <FabButton
          label="افزودن عادت"
          onPress={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        />
      </View>

      <SheetModal visible={formOpen} title={editing ? 'ویرایش عادت' : 'عادت جدید'} onClose={() => setFormOpen(false)}>
        <HabitForm
          initial={editing}
          onSave={(data) => {
            if (editing) useHabits.getState().update(editing.id, data);
            else useHabits.getState().add(data);
            setFormOpen(false);
            setEditing(null);
          }}
          onDelete={
            editing
              ? () => {
                  useHabits.getState().remove(editing.id);
                  setFormOpen(false);
                  setEditing(null);
                }
              : undefined
          }
        />
      </SheetModal>
    </View>
  );
}
