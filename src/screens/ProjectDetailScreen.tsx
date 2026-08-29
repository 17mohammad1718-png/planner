import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { RootStackParamList } from '../components/BottomTabs';
import { ProjectForm } from '../components/forms';
import { SheetModal } from '../components/SheetModal';
import { BackButton, Card, CheckCircle, ProgressBar, SectionHeader } from '../components/ui';
import { formatISOJalali, toFa, todayISO } from '../lib/jalali';
import { useProjects } from '../stores';

export function ProjectDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ProjectDetail'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const projects = useProjects((s) => s.items);
  const [newTask, setNewTask] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      useProjects.getState().load();
    }, []),
  );

  const project = projects.find((p) => p.id === route.params.id);

  if (!project) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <Text className="text-slate-400">پروژه پیدا نشد</Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-3">
          <Text className="font-bold text-indigo-600">بازگشت</Text>
        </Pressable>
      </View>
    );
  }

  const doneCount = project.tasks.filter((x) => x.done).length;
  const pct = project.tasks.length ? Math.round((doneCount / project.tasks.length) * 100) : 0;
  const t = todayISO();
  const overdue = project.status !== 'done' && project.deadline != null && project.deadline < t;

  const addTask = () => {
    const title = newTask.trim();
    if (!title) return;
    useProjects.getState().addTask(project.id, title);
    setNewTask('');
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-5 pt-4 pb-3">
        <BackButton onPress={() => navigation.goBack()} />
        <View className="flex-1 ps-3">
          <Text className="text-2xl font-extrabold text-slate-900">جزئیات پروژه</Text>
        </View>
        <Pressable onPress={() => setEditOpen(true)} className="rounded-full bg-white p-2 shadow-sm">
          <Ionicons name="create-outline" size={20} color="#475569" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-lg font-extrabold text-slate-900">{project.title}</Text>
            <Pressable
              onPress={() =>
                useProjects.getState().update(project.id, {
                  status: project.status === 'done' ? 'active' : 'done',
                })
              }
              className="rounded-full bg-slate-100 px-3 py-1"
            >
              <Text className="text-xs font-bold text-slate-600">
                {project.status === 'done' ? 'ادامه پروژه' : 'پایان پروژه'}
              </Text>
            </Pressable>
          </View>
          {project.description ? <Text className="mt-2 text-sm text-slate-500">{project.description}</Text> : null}
          {project.deadline ? (
            <View className="mt-3 flex-row items-center rounded-xl bg-slate-50 px-3 py-2">
              <Text className="text-sm">📅</Text>
              <Text className={`flex-1 px-2 text-sm font-semibold ${overdue ? 'text-red-600' : 'text-slate-600'}`}>
                {overdue ? 'دیر شده: ' : 'ددلاین: '}
                {formatISOJalali(project.deadline)}
              </Text>
            </View>
          ) : null}
          <View className="mt-4 flex-row items-center">
            <ProgressBar value={pct} className={project.status === 'done' ? 'bg-emerald-500' : 'bg-indigo-500'} />
            <Text className="ps-2 text-sm font-bold text-slate-500">{toFa(pct)}٪</Text>
          </View>
        </Card>

        <SectionHeader title={`تسک‌ها (${toFa(doneCount)}/${toFa(project.tasks.length)})`} />
        <Card>
          {project.tasks.length === 0 ? (
            <Text className="text-sm text-slate-400">هنوز تسکی اضافه نشده</Text>
          ) : (
            project.tasks.map((task, i) => (
              <View
                key={task.id}
                className={`flex-row items-center ${i > 0 ? 'mt-3 border-t border-slate-100 pt-3' : ''}`}
              >
                <CheckCircle
                  checked={task.done === 1}
                  size={22}
                  onPress={() => useProjects.getState().toggleTask(task.id, task.done ? 0 : 1)}
                />
                <Text className={`flex-1 px-2 text-sm ${task.done === 1 ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {task.title}
                </Text>
                <Pressable onPress={() => useProjects.getState().removeTask(task.id)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={16} color="#cbd5e1" />
                </Pressable>
              </View>
            ))
          )}
        </Card>

        <View className="mt-3 flex-row items-center gap-2">
          <TextInput
            value={newTask}
            onChangeText={setNewTask}
            placeholder="تسک جدید…"
            placeholderTextColor="#94a3b8"
            returnKeyType="done"
            onSubmitEditing={addTask}
            className="flex-1 rounded-xl bg-white px-4 py-3 text-sm text-slate-800"
          />
          <Pressable onPress={addTask} className="rounded-xl bg-indigo-600 px-4 py-3 active:opacity-90">
            <Text className="font-bold text-white">افزودن</Text>
          </Pressable>
        </View>
      </ScrollView>

      <SheetModal visible={editOpen} title="ویرایش پروژه" onClose={() => setEditOpen(false)}>
        <ProjectForm
          initial={project}
          onSave={(data) => {
            useProjects.getState().update(project.id, data);
            setEditOpen(false);
          }}
          onDelete={() => {
            useProjects.getState().remove(project.id);
            setEditOpen(false);
            navigation.navigate('Tabs', { screen: 'Projects' });
          }}
        />
      </SheetModal>
    </View>
  );
}
