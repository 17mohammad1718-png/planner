import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { RootStackParamList } from '../components/BottomTabs';
import { ProjectForm } from '../components/forms';
import { SheetModal } from '../components/SheetModal';
import { Card, EmptyState, FabButton, ProgressBar, ScreenHeader } from '../components/ui';
import { formatISOJalali, toFa, todayISO } from '../lib/jalali';
import { PROJECT_STATUS_LABELS, type Project } from '../types';
import { useProjects } from '../stores';

export function ProjectsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const projects = useProjects((s) => s.items);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  useFocusEffect(
    useCallback(() => {
      useProjects.getState().load();
    }, []),
  );

  const t = todayISO();
  const pctOf = (p: { tasks: { done: number }[] }) =>
    p.tasks.length ? Math.round((p.tasks.filter((x) => x.done).length / p.tasks.length) * 100) : 0;

  return (
    <View className="flex-1 bg-slate-50">
      <ScreenHeader title="پروژه‌ها" subtitle={`${toFa(projects.length)} پروژه`} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {projects.length === 0 ? (
          <EmptyState emoji="📁" title="هنوز پروژه‌ای نداری" hint="هر ایده‌ای جدی شد، پروژه‌اش کن" />
        ) : (
          projects.map((p) => {
            const pct = pctOf(p);
            const overdue = p.status !== 'done' && p.deadline != null && p.deadline < t;
            return (
              <Card key={p.id} className="mb-3">
                <Pressable
                  className="flex-row items-center justify-between"
                  onPress={() => navigation.navigate('ProjectDetail', { id: p.id })}
                >
                  <Text className="flex-1 font-bold text-slate-900" numberOfLines={1}>
                    {p.title}
                  </Text>
                  <View className="rounded-full bg-slate-100 px-2.5 py-0.5">
                    <Text className="text-xs font-bold text-slate-600">{PROJECT_STATUS_LABELS[p.status]}</Text>
                  </View>
                </Pressable>
                <View className="mt-3 flex-row items-center">
                  <ProgressBar value={pct} className={p.status === 'done' ? 'bg-emerald-500' : 'bg-indigo-500'} />
                  <Text className="ps-2 text-xs font-bold text-slate-400">{toFa(pct)}٪</Text>
                </View>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className={`text-xs ${overdue ? 'font-bold text-red-500' : 'text-slate-400'}`}>
                    {p.deadline
                      ? `${overdue ? '⚠️ دیر شده — ' : '📅 '}${formatISOJalali(p.deadline)}`
                      : 'بدون ددلاین'}
                  </Text>
                  <Text className="text-xs text-slate-400">
                    {toFa(p.tasks.filter((x) => x.done).length)}/{toFa(p.tasks.length)} تسک
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setEditing(p);
                    setFormOpen(true);
                  }}
                  hitSlop={6}
                  className="mt-2 self-end rounded-full bg-slate-50 px-3 py-1"
                >
                  <Text className="text-xs font-semibold text-indigo-600">ویرایش</Text>
                </Pressable>
              </Card>
            );
          })
        )}
      </ScrollView>

      <View className="flex-row justify-end px-5 pb-5 pt-1">
        <FabButton
          label="افزودن پروژه"
          onPress={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        />
      </View>

      <SheetModal visible={formOpen} title={editing ? 'ویرایش پروژه' : 'پروژه جدید'} onClose={() => setFormOpen(false)}>
        <ProjectForm
          initial={editing}
          onSave={(data) => {
            if (editing) useProjects.getState().update(editing.id, data);
            else useProjects.getState().add(data);
            setFormOpen(false);
            setEditing(null);
          }}
          onDelete={
            editing
              ? () => {
                  useProjects.getState().remove(editing.id);
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
