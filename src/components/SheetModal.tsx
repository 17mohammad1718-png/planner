import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

export function SheetModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-3xl bg-white px-5 pt-3" style={{ maxHeight: '85%' }}>
          <View className="mb-3 h-1.5 w-10 self-center rounded-full bg-slate-200" />
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-900">{title}</Text>
            <Pressable onPress={onClose} hitSlop={8} className="rounded-full bg-slate-100 p-1.5">
              <Ionicons name="close" size={18} color="#64748b" />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
            <View className="h-6" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
