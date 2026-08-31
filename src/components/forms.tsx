import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import {
  formatISOJalali,
  toFa,
  todayISO,
} from '../lib/jalali';
import type {
  Habit,
  Idea,
  IdeaStatus,
  Priority,
  Project,
  ProjectStatus,
  RepeatMode,
  Task,
} from '../types';
import {
  IDEA_STATUS_LABELS,
  PRIORITY_LABELS,
  PROJECT_STATUS_LABELS,
  REPEAT_LABELS,
} from '../types';
import { Chip } from './ui';
import { DateSelectModal } from './DateSelectModal';

const INPUT_CLASS = 'rounded-xl bg-slate-100 px-4 py-3 text-base text-slate-900';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-semibold text-slate-700">{label}</Text>
      {children}
    </View>
  );
}

function SaveButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`mt-1 items-center rounded-2xl py-3.5 ${disabled ? 'bg-slate-200' : 'bg-indigo-600 active:opacity-90'}`}
    >
      <Text className={`font-bold ${disabled ? 'text-slate-400' : 'text-white'}`}>{label}</Text>
    </Pressable>
  );
}

function DeleteButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="mt-3 items-center">
      <Text className="font-semibold text-red-600">{label}</Text>
    </Pressable>
  );
}

/* ----------------------------- Task form ---------------------------- */

export function TaskForm({
  initial,
  onSave,
  onDelete,
}: {
  initial?: Task | null;
  onSave: (data: {
    title: string;
    description: string;
    date: string;
    time: string | null;
    repeat: RepeatMode;
    priority: Priority;
  }) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [time, setTime] = useState<string | null>(initial?.time ?? null);
  const [repeat, setRepeat] = useState<RepeatMode>(initial?.repeat ?? 'none');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [pickOpen, setPickOpen] = useState(false);

  const times: (string | null)[] = [null, '09:00', '12:00', '14:00', '17:00', '20:00'];
  const timeLabel = (t: string | null) => (t == null ? 'بدون ساعت' : toFa(t));

  const save = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      repeat,
      priority,
    });
  };

  return (
    <View>
      <Field label="عنوان *">
        <TextInput value={title} onChangeText={setTitle} placeholder="مثلاً: جلسه با مشتری" className={INPUT_CLASS} />
      </Field>
      <Field label="توضیح">
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="اختیاری"
          multiline
          className={INPUT_CLASS}
        />
      </Field>
      <Field label="تاریخ">
        <Pressable
          onPress={() => setPickOpen(true)}
          className="flex-row items-center justify-between rounded-xl bg-slate-100 px-4 py-3"
        >
          <Text className="font-semibold text-slate-900">{formatISOJalali(date)}</Text>
          <Text className="text-sm font-semibold text-indigo-600">تغییر</Text>
        </Pressable>
      </Field>
      <Field label="ساعت">
        <View className="flex-row flex-wrap gap-2">
          {times.map((t) => (
            <Chip key={String(t)} label={timeLabel(t)} active={time === t} onPress={() => setTime(t)} />
          ))}
        </View>
      </Field>
      <Field label="تکرار">
        <View className="flex-row flex-wrap gap-2">
          {(['none', 'daily', 'weekly'] as RepeatMode[]).map((r) => (
            <Chip key={r} label={REPEAT_LABELS[r]} active={repeat === r} onPress={() => setRepeat(r)} />
          ))}
        </View>
      </Field>
      <Field label="اولویت">
        <View className="flex-row flex-wrap gap-2">
          {(['low', 'medium', 'high'] as Priority[]).map((p) => (
            <Chip
              key={p}
              label={PRIORITY_LABELS[p]}
              active={priority === p}
              activeClass={
                p === 'high'
                  ? 'bg-red-500'
                  : p === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              }
              onPress={() => setPriority(p)}
            />
          ))}
        </View>
      </Field>
      <SaveButton label={initial ? 'ذخیره تغییرات' : 'افزودن کار'} disabled={!title.trim()} onPress={save} />
      {onDelete ? <DeleteButton label="حذف کار" onPress={onDelete} /> : null}
      <DateSelectModal visible={pickOpen} initialISO={date} onClose={() => setPickOpen(false)} onPick={setDate} />
    </View>
  );
}

/* ---------------------------- Idea form ----------------------------- */

export function IdeaForm({
  initial,
  onSave,
  onDelete,
}: {
  initial?: Idea | null;
  onSave: (data: { title: string; description: string; tags: string; status: IdeaStatus }) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [tags, setTags] = useState(initial?.tags ?? '');
  const [status, setStatus] = useState<IdeaStatus>(initial?.status ?? 'raw');

  const save = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), tags: tags.trim(), status });
  };

  return (
    <View>
      <Field label="عنوان *">
        <TextInput value={title} onChangeText={setTitle} placeholder="مثلاً: اپ یادداشت صوتی" className={INPUT_CLASS} />
      </Field>
      <Field label="توضیح">
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="اختیاری"
          multiline
          className={INPUT_CLASS}
        />
      </Field>
      <Field label="تگ‌ها (با ویرگول جدا کنید)">
        <TextInput
          value={tags}
          onChangeText={setTags}
          placeholder="مثلاً: اندروید, اپ"
          className={INPUT_CLASS}
        />
      </Field>
      <Field label="وضعیت">
        <View className="flex-row flex-wrap gap-2">
          {(Object.keys(IDEA_STATUS_LABELS) as IdeaStatus[]).map((s) => (
            <Chip key={s} label={IDEA_STATUS_LABELS[s]} active={status === s} onPress={() => setStatus(s)} />
          ))}
        </View>
      </Field>
      <SaveButton label={initial ? 'ذخیره تغییرات' : 'افزودن ایده'} disabled={!title.trim()} onPress={save} />
      {onDelete ? <DeleteButton label="حذف ایده" onPress={onDelete} /> : null}
    </View>
  );
}

/* --------------------------- Project form --------------------------- */

export function ProjectForm({
  initial,
  onSave,
  onDelete,
}: {
  initial?: Project | null;
  onSave: (data: {
    title: string;
    description: string;
    deadline: string | null;
    status: ProjectStatus;
  }) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [deadline, setDeadline] = useState<string | null>(initial?.deadline ?? null);
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'active');
  const [pickOpen, setPickOpen] = useState(false);

  const save = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), deadline, status });
  };

  return (
    <View>
      <Field label="عنوان *">
        <TextInput value={title} onChangeText={setTitle} placeholder="مثلاً: توسعه اپ" className={INPUT_CLASS} />
      </Field>
      <Field label="توضیح">
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="اختیاری"
          multiline
          className={INPUT_CLASS}
        />
      </Field>
      <Field label="ددلاین">
        <Pressable
          onPress={() => setPickOpen(true)}
          className="flex-row items-center justify-between rounded-xl bg-slate-100 px-4 py-3"
        >
          <Text className="font-semibold text-slate-900">
            {deadline ? formatISOJalali(deadline) : 'بدون ددلاین'}
          </Text>
          <Text className="text-sm font-semibold text-indigo-600">{deadline ? 'تغییر' : 'انتخاب'}</Text>
        </Pressable>
        {deadline ? (
          <Pressable onPress={() => setDeadline(null)} className="mt-2">
            <Text className="text-sm font-semibold text-red-500">حذف ددلاین</Text>
          </Pressable>
        ) : null}
      </Field>
      <Field label="وضعیت">
        <View className="flex-row flex-wrap gap-2">
          {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((s) => (
            <Chip key={s} label={PROJECT_STATUS_LABELS[s]} active={status === s} onPress={() => setStatus(s)} />
          ))}
        </View>
      </Field>
      <SaveButton label={initial ? 'ذخیره تغییرات' : 'افزودن پروژه'} disabled={!title.trim()} onPress={save} />
      {onDelete ? <DeleteButton label="حذف پروژه" onPress={onDelete} /> : null}
      <DateSelectModal
        visible={pickOpen}
        initialISO={deadline}
        onClose={() => setPickOpen(false)}
        onPick={setDeadline}
      />
    </View>
  );
}

/* ---------------------------- Habit form ---------------------------- */

const HABIT_ICONS = ['💪', '📚', '🧘', '🏃', '💧', '🥗', '😴', '🎯', '🎸', '🧹', '💊', '✍️'];
const HABIT_COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#0ea5e9', '#ec4899'];

export function HabitForm({
  initial,
  onSave,
  onDelete,
}: {
  initial?: Habit | null;
  onSave: (data: { title: string; icon: string; color: string }) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '💪');
  const [color, setColor] = useState(initial?.color ?? '#4f46e5');

  const save = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), icon, color });
  };

  return (
    <View>
      <Field label="عنوان *">
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="مثلاً: ورزش, مطالعه, مدیتیشن"
          className={INPUT_CLASS}
        />
      </Field>
      <Field label="آیکون">
        <View className="flex-row flex-wrap gap-2">
          {HABIT_ICONS.map((i) => (
            <Pressable
              key={i}
              onPress={() => setIcon(i)}
              className="items-center justify-center rounded-xl"
              style={{
                width: 44,
                height: 44,
                backgroundColor: icon === i ? '#e0e7ff' : '#f1f5f9',
                borderWidth: icon === i ? 2 : 0,
                borderColor: '#4f46e5',
              }}
            >
              <Text className="text-2xl">{i}</Text>
            </Pressable>
          ))}
        </View>
      </Field>
      <Field label="رنگ">
        <View className="flex-row gap-3">
          {HABIT_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              className="rounded-full"
              style={{
                width: 30,
                height: 30,
                backgroundColor: c,
                borderWidth: color === c ? 3 : 0,
                borderColor: '#0f172a',
              }}
            />
          ))}
        </View>
      </Field>
      <SaveButton label={initial ? 'ذخیره تغییرات' : 'افزودن عادت'} disabled={!title.trim()} onPress={save} />
      {onDelete ? <DeleteButton label="حذف عادت" onPress={onDelete} /> : null}
    </View>
  );
}
