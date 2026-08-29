import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import {
  formatJalali,
  gregorianOf,
  jalaliMonthTitle,
  parseISO,
  toISO,
  toJalali,
  todayISO,
  type JalaliDate,
} from '../lib/jalali';
import { CalendarGrid } from './CalendarGrid';
import { SheetModal } from './SheetModal';

interface Props {
  visible: boolean;
  title?: string;
  initialISO?: string | null;
  onClose: () => void;
  onPick: (iso: string) => void;
}

export function DateSelectModal({ visible, title = 'انتخاب تاریخ', initialISO, onClose, onPick }: Props) {
  const init = (): { view: { y: number; m: number }; sel: JalaliDate } => {
    const iso = initialISO && initialISO.length > 0 ? initialISO : todayISO();
    const { gy, gm, gd } = parseISO(iso);
    const j = toJalali(gy, gm, gd);
    return { view: { y: j.jy, m: j.jm }, sel: j };
  };

  const [state, setState] = useState(init);
  useEffect(() => {
    if (visible) setState(init());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const { view, sel } = state;
  const selKey = toISO(gregorianOf(sel));

  const shift = (dir: number) => {
    setState((s) => {
      let m = s.view.m + dir;
      let y = s.view.y;
      if (m < 1) {
        m = 12;
        y -= 1;
      }
      if (m > 12) {
        m = 1;
        y += 1;
      }
      return { ...s, view: { y, m } };
    });
  };

  return (
    <SheetModal visible={visible} title={title} onClose={onClose}>
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable onPress={() => shift(-1)} className="rounded-full bg-slate-100 p-2">
          <Ionicons name="chevron-forward" size={20} color="#475569" />
        </Pressable>
        <Text className="text-base font-bold text-slate-900">{jalaliMonthTitle(view.y, view.m)}</Text>
        <Pressable onPress={() => shift(1)} className="rounded-full bg-slate-100 p-2">
          <Ionicons name="chevron-back" size={20} color="#475569" />
        </Pressable>
      </View>
      <CalendarGrid
        type="jalali"
        year={view.y}
        month={view.m}
        todayKey={todayISO()}
        selectedKey={selKey}
        onDayPress={(iso) => {
          const { gy, gm, gd } = parseISO(iso);
          setState((s) => ({ ...s, sel: toJalali(gy, gm, gd) }));
        }}
      />
      <View className="mt-4 items-center rounded-2xl bg-indigo-50 py-3">
        <Text className="text-sm text-slate-600">تاریخ انتخابی:</Text>
        <Text className="mt-0.5 text-base font-bold text-indigo-700">{formatJalali(sel, true)}</Text>
      </View>
      <Pressable
        onPress={() => {
          onPick(selKey);
          onClose();
        }}
        className="mt-4 items-center rounded-2xl bg-indigo-600 py-3.5 active:opacity-90"
      >
        <Text className="font-bold text-white">انتخاب این تاریخ</Text>
      </Pressable>
    </SheetModal>
  );
}
