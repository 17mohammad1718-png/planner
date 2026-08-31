import React from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  gregorianMonthCells,
  gregorianOf,
  jalaliMonthCells,
  toFa,
  toISO,
  WEEKDAY_LETTERS,
} from '../lib/jalali';

export interface DayDots {
  task?: boolean;
  habit?: boolean;
  deadline?: boolean;
}

interface Props {
  type: 'jalali' | 'gregorian';
  year: number;
  month: number;
  todayKey: string;
  selectedKey?: string | null;
  dots?: Record<string, DayDots>;
  onDayPress?: (iso: string) => void;
  compact?: boolean;
}

export function CalendarGrid({
  type,
  year,
  month,
  todayKey,
  selectedKey,
  dots = {},
  onDayPress,
  compact = false,
}: Props) {
  const cells = type === 'jalali' ? jalaliMonthCells(year, month) : gregorianMonthCells(year, month);
  const keyOf = (day: number): string =>
    type === 'jalali'
      ? toISO(gregorianOf({ jy: year, jm: month, jd: day }))
      : `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <View>
      <View className="flex-row">
        {WEEKDAY_LETTERS.map((w) => (
          <View key={w} className="flex-1 items-center py-1">
            <Text className="text-xs font-semibold text-slate-400">{w}</Text>
          </View>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} className="flex-row">
          {row.map((day, di) => {
            if (day == null) return <View key={di} className="flex-1" />;
            const key = keyOf(day);
            const isToday = key === todayKey;
            const isSel = key === selectedKey;
            const dot = dots[key] || {};
            return (
              <View key={di} className={`flex-1 items-center ${compact ? 'py-0' : 'py-0.5'}`}>
                <Pressable onPress={() => onDayPress?.(key)}>
                  <View
                    className={`items-center justify-center rounded-full ${
                      compact ? 'h-6 w-6' : 'h-9 w-9'
                    } ${isToday ? 'bg-indigo-600' : isSel ? 'bg-indigo-50' : ''}`}
                    style={isSel && !isToday ? { borderWidth: 1.5, borderColor: '#6366f1' } : undefined}
                  >
                    <Text
                      className={`${compact ? 'text-xs' : 'text-sm'} ${
                        isToday ? 'font-bold text-white' : 'text-slate-700'
                      }`}
                    >
                      {toFa(day)}
                    </Text>
                  </View>
                </Pressable>
                <View className={`${compact ? 'h-1.5' : 'h-2'} flex-row items-center justify-center`}>
                  {dot.task ? (
                    <View className={`${compact ? 'mx-px h-1 w-1' : 'mx-0.5 h-1.5 w-1.5'} rounded-full bg-indigo-500`} />
                  ) : null}
                  {dot.habit ? (
                    <View className={`${compact ? 'mx-px h-1 w-1' : 'mx-0.5 h-1.5 w-1.5'} rounded-full bg-emerald-500`} />
                  ) : null}
                  {dot.deadline ? (
                    <View className={`${compact ? 'mx-px h-1 w-1' : 'mx-0.5 h-1.5 w-1.5'} rounded-full bg-amber-500`} />
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
