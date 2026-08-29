import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { IdeaForm } from '../components/forms';
import { SheetModal } from '../components/SheetModal';
import { Card, EmptyState, FabButton, ScreenHeader } from '../components/ui';
import { formatISOJalali } from '../lib/jalali';
import { IDEA_STATUS_LABELS, IDEA_STATUS_ORDER, type Idea } from '../types';
import { useIdeas } from '../stores';

export function IdeasScreen() {
  const ideas = useIdeas((s) => s.items);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Idea | null>(null);

  useFocusEffect(
    useCallback(() => {
      useIdeas.getState().load();
    }, []),
  );

  const cycleStatus = (idea: Idea) => {
    const next = IDEA_STATUS_ORDER[(IDEA_STATUS_ORDER.indexOf(idea.status) + 1) % IDEA_STATUS_ORDER.length];
    useIdeas.getState().update(idea.id, { status: next });
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScreenHeader title="ایده‌ها" subtitle="هر جرقه‌ای که به ذهنت می‌رسد 💡" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {ideas.length === 0 ? (
          <EmptyState emoji="💡" title="هنوز ایده‌ای نداری" hint="با دکمه پایین اولین ایده‌ات رو ثبت کن" />
        ) : (
          ideas.map((idea) => (
            <Card key={idea.id} className="mb-3">
              <Pressable
                className="flex-row items-start justify-between"
                onPress={() => {
                  setEditing(idea);
                  setFormOpen(true);
                }}
              >
                <View className="flex-1 pe-2">
                  <Text className="font-bold text-slate-900">{idea.title}</Text>
                  {idea.description ? (
                    <Text className="mt-1 text-sm text-slate-500" numberOfLines={2}>
                      {idea.description}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => cycleStatus(idea)}
                  hitSlop={6}
                  className="rounded-full bg-slate-100 px-3 py-1"
                >
                  <Text className="text-xs font-bold text-slate-600">{IDEA_STATUS_LABELS[idea.status]}</Text>
                </Pressable>
              </Pressable>
              <View className="mt-3 flex-row items-center justify-between">
                <View className="flex-row flex-wrap gap-1.5">
                  {idea.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <View key={tag} className="rounded-full bg-indigo-50 px-2.5 py-0.5">
                        <Text className="text-xs text-indigo-600">#{tag}</Text>
                      </View>
                    ))}
                </View>
                <Text className="text-xs text-slate-300">{formatISOJalali(idea.created_at)}</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <View className="flex-row justify-end px-5 pb-5 pt-1">
        <FabButton
          label="افزودن ایده"
          onPress={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        />
      </View>

      <SheetModal visible={formOpen} title={editing ? 'ویرایش ایده' : 'ایده جدید'} onClose={() => setFormOpen(false)}>
        <IdeaForm
          initial={editing}
          onSave={(data) => {
            if (editing) useIdeas.getState().update(editing.id, data);
            else useIdeas.getState().add(data);
            setFormOpen(false);
            setEditing(null);
          }}
          onDelete={
            editing
              ? () => {
                  useIdeas.getState().remove(editing.id);
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
