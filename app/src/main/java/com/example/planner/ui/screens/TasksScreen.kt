package com.example.planner.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.planner.PlannerViewModel
import com.example.planner.data.Task
import com.example.planner.lib.JDate
import com.example.planner.ui.*

private val REPEATS = listOf("none" to "تک", "daily" to "روزانه", "weekly" to "هفتگی", "custom" to "سفارشی")
private val PRIORITIES = listOf("low" to "کم", "normal" to "عادی", "high" to "زیاد")
private fun prioColor(p: String) = when (p) { "high" -> Color(0xFFEF4444); "low" -> Color(0xFF22C55E); else -> Color(0xFFF59E0B) }

@Composable
fun TasksScreen(vm: PlannerViewModel) {
    val tasks by vm.tasks.collectAsState()
    var showDialog by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(contentPadding = PaddingValues(bottom = 88.dp)) {
            item { PlannerScreenHeader("کارها", todayJalaliLabel()) }
            if (tasks.isEmpty()) item { EmptyHint("کارش رو ثبت کن، بعداً یادت نره") }
            items(tasks, key = { it.id }) { t ->
                TaskCard(t, onToggle = { vm.toggleTask(t) }, onDelete = { vm.deleteTask(t) })
            }
        }
        Box(modifier = Modifier.align(Alignment.BottomEnd).padding(20.dp)) {
            AddFloatingButton { showDialog = true }
        }
    }
    if (showDialog) NewTaskDialog(
        onDismiss = { showDialog = false },
        onSave = { title, date, time, repeat, prio ->
            vm.addTask(Task(title = title, date = date, time = time, repeat = repeat, priority = prio))
            showDialog = false
        }
    )
}

@Composable
private fun TaskCard(t: Task, onToggle: () -> Unit, onDelete: () -> Unit) {
    val jd = JDate.fromKey(t.date)
    val dateLabel = if (jd != null) "${jd.day} ${jd.monthName}" else (if (t.date.isNotEmpty()) t.date else "بدون تاریخ")
    AppCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked = t.done, onCheckedChange = { onToggle() })
            Column(modifier = Modifier.weight(1f)) {
                Text(t.title, style = MaterialTheme.typography.titleSmall,
                    textDecoration = if (t.done) androidx.compose.ui.text.style.TextDecoration.LineThrough else null,
                    color = if (t.done) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface)
                Text("$dateLabel ${if (t.time.isNotEmpty()) "• ${t.time}" else ""}",
                    style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Surface(color = prioColor(t.priority), shape = androidx.compose.foundation.shape.RoundedCornerShape(6.dp)) {
                Text(PRIORITIES.first { it.first == t.priority }.second,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                    fontSize = MaterialTheme.typography.labelSmall.fontSize, color = Color.White)
            }
            IconButton(onClick = onDelete) { Icon(Icons.Filled.Delete, "حذف", tint = MaterialTheme.colorScheme.error) }
        }
    }
}

@Composable
private fun NewTaskDialog(onDismiss: () -> Unit, onSave: (String, String, String, String, String) -> Unit) {
    var title by remember { mutableStateOf("") }
    var date by remember { mutableStateOf(JDate.today().toKey()) }
    var time by remember { mutableStateOf("") }
    var repeat by remember { mutableStateOf("none") }
    var prio by remember { mutableStateOf("normal") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("کار جدید") },
        text = {
            Column {
                OutlinedTextField(title, { title = it }, label = { Text("عنوان") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(date, { date = it }, label = { Text("تاریخ (شمسی " + JDate.today().year + "-mm-dd)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(time, { time = it }, label = { Text("ساعت (اختیاری)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                Row {
                    repeat.forEach { (k, l) -> StatusChip(l, active = repeat == k) { repeat = k }; Spacer(Modifier.width(6.dp)) }
                }
                Spacer(Modifier.height(8.dp))
                Row {
                    PRIORITIES.forEach { (k, l) -> StatusChip(l, active = prio == k) { prio = k }; Spacer(Modifier.width(6.dp)) }
                }
            }
        },
        confirmButton = { TextButton(onClick = { if (title.isNotBlank()) onSave(title.trim(), date, time.trim(), repeat, prio) }) { Text("ذخیره") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("انصراف") } }
    )
}
