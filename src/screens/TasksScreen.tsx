import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { RootStackParamList } from '../components/BottomTabs';
import { TaskForm } from '../components/forms';
import { SheetModal } from '../components/SheetModal';
import {
  BackButton,
  Card,
  CheckCircle,
  Chip,
  EmptyState,
  FabButton,
} from '../components/ui';
import { formatISOJalali, taskShowsOn, toFa, todayISO } from '../lib/jalali';
import { PRIORITY_LABELS, REPEAT_LABELS, type Priority, type Task } from '../types';
import { useTasks } from '../stores';

type Filter = 'all' | 'today' | 'overdue' | 'done';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'همه' },
  { key: 'today', label: 'امروز' },
  { key: 'overdue', label: 'دیر شده' },
  { key: 'done', label: 'انجام شده' },
];

function PriorityBadge({ p }: { p: Priority }) {
  const map = {
    high: ['bg-red-50', 'text-red-600'],
    medium: ['bg-amber-50', 'text-amber-600'],
    low: ['bg-emerald-50', 'text-emerald-600'],
  } as const;
  return (
    <View className={`rounded-full px-2 py-0.5 ${map[p][0]}`}>
      <Text className={`text-xs font-semibold ${map[p][1]}`}>{PRIORITY_LABELS[p]}</Text>
    </View>
  );
}

export function TasksScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const tasks = useTasks((s) => s.tasks);
  const [filter, setFilter] = useState<Filter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  useFocusEffect(
    useCallback(() => {
      useTasks.getState().load();
    }, []),
  );

  const t = todayISO();
  const list = useMemo(() => {
    const base = tasks.filter((x) => {
      if (filter === 'today') return taskShowsOn(x, t) || (x.date === t && x.done === 1);
      if (filter === 'overdue') return x.done !== 1 && x.repeat === 'none' && x.date < t;
      if (filter === 'done') return x.done === 1;
      return true;
    });
    return [...base].sort((a, b) =>
      a.date + (a.time ?? '') < b.date + (b.time ?? '') ? -1 : 1,
    );
  }, [tasks, filter, t]);

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-5 pt-4 pb-3">
        <BackButton onPress={() => navigation.goBack()} />
        <View className="flex-1 ps-3">
          <Text className="text-2xl font-extrabold text-slate-900">کارها</Text>
          <Text className="mt-1 text-sm text-slate-500">{toFa(list.length)} کار</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 10 }}
      >
        {FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
        ))}
      </ScrollView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {list.length === 0 ? (
          <EmptyState emoji="🎉" title="چیزی اینجا نیست" hint="با دکمه پایین یک کار جدید بساز" />
        ) : (
          list.map((task) => (
            <Card key={task.id} className="mb-3">
              <Pressable
                className="flex-row items-center"
                onPress={() => {
                  setEditing(task);
                  setFormOpen(true);
                }}
              >
                <CheckCircle checked={task.done === 1} onPress={() => useTasks.getState().toggle(task.id)} />
                <View className="flex-1 px-3">
                  <Text className={`font-semibold ${task.done === 1 ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.title}
                  </Text>
                  <View className="mt-1.5 flex-row flex-wrap items-center gap-2">
                    <Text className="text-xs text-slate-400">📅 {formatISOJalali(task.date)}</Text>
                    {task.time ? (
                      <View className="rounded-full bg-slate-100 px-2 py-0.5">
                        <Text className="text-xs text-slate-500">{toFa(task.time)}</Text>
                      </View>
                    ) : null}
                    {task.repeat !== 'none' ? (
                      <View className="rounded-full bg-sky-50 px-2 py-0.5">
                        <Text className="text-xs text-sky-600">{REPEAT_LABELS[task.repeat]}</Text>
                      </View>
                    ) : null}
                    <PriorityBadge p={task.priority} />
                  </View>
                </View>
              </Pressable>
            </Card>
          ))
        )}
      </ScrollView>

      <View className="flex-row justify-end px-5 pb-5 pt-1">
        <FabButton
          label="افزودن کار"
          onPress={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        />
      </View>

      <SheetModal
        visible={formOpen}
        title={editing ? 'ویرایش کار' : 'کار جدید'}
        onClose={() => setFormOpen(false)}
      >
        <TaskForm
          initial={editing}
          onSave={(data) => {
            if (editing) useTasks.getState().update(editing.id, data);
            else useTasks.getState().add(data);
            setFormOpen(false);
            setEditing(null);
          }}
          onDelete={
            editing
              ? () => {
                  useTasks.getState().remove(editing.id);
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
