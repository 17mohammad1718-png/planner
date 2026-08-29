package com.example.planner.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.DateRange
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
import com.example.planner.lib.*
import com.example.planner.ui.*
import java.util.Calendar

private val WEEK_LABELS = listOf("ش", "ی", "د", "س", "چ", "پ", "ج")

enum class CalMode { JALALI, GREGORIAN }
private data class Cell(val day: Int, val jkey: String, val inMonth: Boolean, val isToday: Boolean)

@Composable
fun CalendarScreen(vm: PlannerViewModel) {
    val tasks by vm.tasks.collectAsState()
    val habits by vm.habits.collectAsState()
    val habitKeys = remember { mutableStateMapOf<Long, Set<String>>() }
    habits.forEach { h ->
        val logs by (remember(h.id) { vm.habitLogs(h.id) }).collectAsState()
        val ks = logs.map { it.date }.toSet()
        if (habitKeys[h.id] != ks) habitKeys[h.id] = ks
    }

    val dotKeys = remember { mutableStateOf(setOf<String>()) }
    LaunchedEffect(tasks, habitKeys) {
        val set = HashSet<String>()
        tasks.forEach { if (it.date.isNotEmpty()) set.add(it.date) }
        habitKeys.values.forEach { set.addAll(it) }
        dotKeys.value = set
    }

    var mode by remember { mutableStateOf(CalMode.JALALI) }
    var jy by remember { mutableStateOf(JDate.today().year) }
    var jm by remember { mutableStateOf(JDate.today().month) }
    var gy by remember { mutableStateOf(GreDate.today().year) }
    var gm by remember { mutableStateOf(GreDate.today().month) }
    var selected by remember { mutableStateOf(JDate.today().toKey()) }

    Column(modifier = Modifier.fillMaxSize()) {
        PlannerScreenHeader("تقویم", todayJalaliLabel())
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)) {
            IconButton(onClick = { if (mode == CalMode.JALALI) { jm--; if (jm < 1) { jm = 12; jy-- } } else { gm--; if (gm < 1) { gm = 12; gy-- } } }) {
                Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, "قبلی")
            }
            val title = when (mode) {
                CalMode.JALALI -> "${JDate.MONTHS[jm - 1]} $jy"
                CalMode.GREGORIAN -> "$gm / $gy"
            }
            Text(title, modifier = Modifier.weight(1f), textAlign = androidx.compose.ui.text.style.TextAlign.Center, fontWeight = FontWeight.Bold, fontSize = 18.sp)
            IconButton(onClick = { if (mode == CalMode.JALALI) { jm++; if (jm > 12) { jm = 1; jy++ } } else { gm++; if (gm > 12) { gm = 1; gy++ } } }) {
                Icon(Icons.AutoMirrored.Filled.KeyboardArrowLeft, "بعدی")
            }
        }
        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
            StatusChip("شمسی", active = mode == CalMode.JALALI) { mode = CalMode.JALALI }
            Spacer(Modifier.width(6.dp))
            StatusChip("میلادی", active = mode == CalMode.GREGORIAN) { mode = CalMode.GREGORIAN }
        }
        // weekday header
        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 6.dp)) {
            WEEK_LABELS.forEach { w ->
                Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                    Text(w, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 12.sp)
                }
            }
        }
        val todayG = GreDate.today()
        val cells = when (mode) {
            CalMode.JALALI -> buildJalaliCells(jy, jm, todayG)
            CalMode.GREGORIAN -> buildGregorianCells(gy, gm, todayG)
        }
        val gregCells = cells.chunked(7)
        gregCells.forEach { week ->
            Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)) {
                week.forEach { cell ->
                    val hasDot = dotKeys.value.contains(cell.jkey)
                    val isSel = selected == cell.jkey
                    Box(
                        modifier = Modifier.weight(1f).aspectRatio(1f).padding(3.dp)
                            .background(
                                when { isSel -> MaterialTheme.colorScheme.primary; cell.isToday -> MaterialTheme.colorScheme.primary.copy(alpha = 0.15f); else -> Color.Transparent },
                                RoundedCornerShape(10.dp)
                            )
                            .clickable { selected = cell.jkey },
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("${cell.day}", color = when { isSel -> MaterialTheme.colorScheme.onPrimary; cell.inMonth -> MaterialTheme.colorScheme.onSurface; else -> MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f) }, fontSize = 14.sp)
                            Box(modifier = Modifier.size(5.dp).background(if (hasDot && cell.inMonth) MaterialTheme.colorScheme.primary else Color.Transparent, RoundedCornerShape(50)))
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        // selected day details
        DayDetail(vm, selected, habitKeys)
    }
}

private fun buildJalaliCells(jy: Int, jm: Int, todayG: GreDate): List<Cell> {
    val todayKey = todayG.toJalali().toKey()
    val dcount = JDate.daysInMonth(jy, jm)
    val g1 = JDate.toGregorianArray(jy, jm, 1)
    val wd1 = JDate.calWeekday(g1[0], g1[1], g1[2])
    return List(42) { idx ->
        val jd = idx - wd1 + 1
        val inMonth = jd in 1..dcount
        val day = if (inMonth) jd else 1
        val key = if (inMonth) JDate(jy, jm, jd).toKey() else ""
        Cell(day, key, inMonth, key == todayKey && inMonth)
    }
}

private fun buildGregorianCells(gy: Int, gm: Int, todayG: GreDate): List<Cell> {
    val todayKey = todayG.toKey()
    val cal = Calendar.getInstance()
    cal.clear(); cal.set(gy, gm - 1, 1)
    val wdFirst = (cal.get(Calendar.DAY_OF_WEEK) + 1) % 7 // 0=Sat
    val maxDay = cal.getActualMaximum(Calendar.DAY_OF_MONTH)
    return List(42) { idx ->
        val gd = idx - wdFirst + 1
        val inMonth = gd in 1..maxDay
        val day = if (inMonth) gd else 1
        val key = if (inMonth) JDate.fromGregorian(gy, gm, gd).toKey() else ""
        Cell(day, key, inMonth, key == todayKey && inMonth)
    }
}

@Composable
private fun DayDetail(vm: PlannerViewModel, selectedKey: String, habitKeys: Map<Long, Set<String>>) {
    val tasks by vm.tasks.collectAsState()
    val habits by vm.habits.collectAsState()
    val sel = JDate.fromKey(selectedKey)
    val title = sel?.let { "${it.weekdayName} ${it.day} ${it.monthName}" } ?: "—"
    val dayTasks = tasks.filter { it.date == selectedKey }
    val dayHabits = habits.filter { habitKeys[it.id]?.contains(selectedKey) == true }

    AppCard {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            Icon(Icons.Filled.DateRange, null, tint = MaterialTheme.colorScheme.primary)
            Spacer(Modifier.width(8.dp))
            Text(title, fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.height(8.dp))
        if (dayTasks.isEmpty() && dayHabits.isEmpty()) {
            Text("برنامه‌ای در این روز نیست", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        dayTasks.forEach { t ->
            Text("• ${t.title}" + (if (t.time.isNotEmpty()) " (${t.time})" else ""), fontSize = 13.sp)
        }
        dayHabits.forEach { h ->
            Text("✓ عادت: ${h.title}", fontSize = 13.sp, color = MaterialTheme.colorScheme.secondary)
        }
    }
}
