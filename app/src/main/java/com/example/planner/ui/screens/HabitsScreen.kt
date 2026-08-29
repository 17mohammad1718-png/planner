package com.example.planner.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.planner.PlannerViewModel
import com.example.planner.data.Habit
import com.example.planner.lib.JDate
import com.example.planner.ui.*
import com.example.planner.ui.theme.HabitColors

@Composable
fun HabitsScreen(vm: PlannerViewModel) {
    val habits by vm.habits.collectAsState()
    var showDialog by remember { mutableStateOf(false) }
    val todayKey = JDate.today().toKey()

    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(contentPadding = PaddingValues(bottom = 88.dp)) {
            item { PlannerScreenHeader("عادت‌ها", todayJalaliLabel()) }
            if (habits.isEmpty()) item { EmptyHint("یک عادت بساز و هر روز تیک بزن") }
            items(habits, key = { it.id }) { h ->
                val logs by vm.habitLogs(h.id).collectAsState()
                HabitCard(h, logs.map { it.date }.toSet(), todayKey,
                    onToggle = { vm.toggleHabitDay(h, it) },
                    onDelete = { vm.deleteHabit(h) })
            }
        }
        Box(modifier = Modifier.align(Alignment.BottomEnd).padding(20.dp)) {
            AddFloatingButton { showDialog = true }
        }
    }
    if (showDialog) NewHabitDialog(
        onDismiss = { showDialog = false },
        onSave = { title, color -> vm.addHabit(title, "star", color); showDialog = false }
    )
}

@Composable
private fun HabitCard(h: Habit, doneKeys: Set<String>, today: String, onToggle: (String) -> Unit, onDelete: () -> Unit) {
    val todayJ = JDate.fromKey(today) ?: JDate.today()
    val week = (6 downTo 0).map { backDays(todayJ, it) }.reversed() // oldest(6 days ago) .. today
    val streak = countStreak(doneKeys)
    val color = Color(h.color)

    AppCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(modifier = Modifier.size(34.dp).background(color, RoundedCornerShape(8.dp)), contentAlignment = Alignment.Center) {
                Text("⚑", color = Color.White, fontSize = 16.sp)
            }
            Column(modifier = Modifier.weight(1f).padding(horizontal = 10.dp)) {
                Text(h.title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                Text("استریک: $streak روز", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Row {
                week.forEach { d ->
                    val key = d.toKey()
                    val checked = doneKeys.contains(key)
                    val isToday = d.toKey() == today
                    Box(
                        modifier = Modifier.size(30.dp).padding(2.dp)
                            .background(color.copy(alpha = if (checked) 1f else (if (isToday) 0.25f else 0.08f)), RoundedCornerShape(8.dp))
                            .clickable { onToggle(key) },
                        contentAlignment = Alignment.Center
                    ) {
                        if (checked) Text("✓", color = Color.White, fontSize = 14.sp)
                        else Text("${d.day}", color = if (isToday) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp)
                    }
                }
            }
            IconButton(onClick = onDelete) { Icon(Icons.Filled.Delete, "حذف", tint = MaterialTheme.colorScheme.error) }
        }
    }
}

/** day going back n days from base (Julian-day arithmetic, robust). */
private fun backDays(base: JDate, n: Int): JDate {
    var jd = JDate.g2d(base.toGregorian().year, base.toGregorian().month, base.toGregorian().day) - n
    return JDate.fromGregorian(d2gSimple(jd))
}
private fun d2gSimple(jdn: Long): Triple<Int, Int, Int> {
    val a = jdn + 32044
    val b = (4 * a + 3) / 146097
    val c = a - 146097 * b / 4
    val d = (4 * c + 3) / 1461
    val e = c - 1461 * d / 4
    val m = (5 * e + 2) / 153
    val gd = (e - (153 * m + 2) / 5 + 1).toInt()
    val gm = (m + 3 - 12 * (m / 10)).toInt()
    val gy = (100 * b + d - 4800 + m / 10).toInt()
    return Triple(gy, gm, gd)
}

private fun countStreak(doneKeys: Set<String>): Int {
    var n = 0
    var day = JDate.today()
    while (true) {
        if (!doneKeys.contains(day.toKey())) break
        n++
        day = backDays(day, 1)
    }
    return n
}

@Composable
private fun NewHabitDialog(onDismiss: () -> Unit, onSave: (String, Long) -> Unit) {
    var title by remember { mutableStateOf("") }
    var colorIdx by remember { mutableStateOf(0) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("عادت جدید") },
        text = {
            Column {
                OutlinedTextField(title, { title = it }, label = { Text("عنوان") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(12.dp))
                Text("رنگ:", style = MaterialTheme.typography.labelMedium)
                Spacer(Modifier.height(6.dp))
                Row {
                    HabitColors.forEachIndexed { i, c ->
                        Box(modifier = Modifier.size(28.dp).padding(3.dp)
                            .background(if (i == colorIdx) Color(0xFF000000).copy(alpha = 0.15f) else Color.Transparent, RoundedCornerShape(50))
                            .padding(3.dp)
                            .background(c, RoundedCornerShape(50))
                            .clickable { colorIdx = i })
                        Spacer(Modifier.width(6.dp))
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = { if (title.isNotBlank()) onSave(title.trim(), HabitColors[colorIdx].value.toLong()) }) { Text("ذخیره") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("انصراف") } }
    )
}
