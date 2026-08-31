import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`rounded-2xl bg-white p-4 shadow-sm ${className}`}>{children}</View>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
      <View className="flex-1 pe-3">
        <Text className="text-2xl font-extrabold text-slate-900">{title}</Text>
        {subtitle != null ? (
          <Text className="mt-1 text-sm text-slate-500">{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function SectionHeader({
  title,
  right,
  onRight,
}: {
  title: string;
  right?: string;
  onRight?: () => void;
}) {
  return (
    <View className="mb-2 mt-5 flex-row items-center justify-between px-1">
      <Text className="font-bold text-slate-800">{title}</Text>
      {right ? (
        <Pressable onPress={onRight} hitSlop={8}>
          <Text className="text-sm font-semibold text-indigo-600">{right}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({ emoji, title, hint }: { emoji: string; title: string; hint?: string }) {
  return (
    <View className="items-center justify-center py-12">
      <Text className="text-5xl">{emoji}</Text>
      <Text className="mt-3 font-bold text-slate-700">{title}</Text>
      {hint ? <Text className="mt-1 text-center text-sm text-slate-400">{hint}</Text> : null}
    </View>
  );
}

export function Chip({
  label,
  active = false,
  onPress,
  activeClass = 'bg-indigo-600',
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  activeClass?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-3.5 py-1.5 ${active ? activeClass : 'border border-slate-200 bg-white'}`}
    >
      <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-600'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ProgressBar({ value, className = 'bg-indigo-500' }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <View className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
      <View className={`h-full rounded-full ${className}`} style={{ width: `${v}%` }} />
    </View>
  );
}

export function FabButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-1.5 rounded-2xl bg-indigo-600 px-5 py-3 active:opacity-80"
      style={{ elevation: 3, shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
    >
      <Ionicons name="add" size={20} color="#fff" />
      <Text className="font-bold text-white">{label}</Text>
    </Pressable>
  );
}

export function CheckCircle({
  checked,
  onPress,
  size = 26,
  color = '#4f46e5',
}: {
  checked: boolean;
  onPress?: () => void;
  size?: number;
  color?: string;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={6} className="items-center justify-center">
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          borderWidth: 2,
          borderColor: checked ? color : '#cbd5e1',
          backgroundColor: checked ? color : 'transparent',
        }}
      >
        {checked ? <Ionicons name="checkmark" size={Math.round(size * 0.62)} color="#fff" /> : null}
      </View>
    </Pressable>
  );
}

/** Back button for RTL layout — arrow points right. */
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      className="items-center justify-center rounded-full bg-white p-2"
      style={{ elevation: 1 }}
    >
      <Ionicons name="chevron-forward" size={22} color="#1e293b" />
    </Pressable>
  );
}
