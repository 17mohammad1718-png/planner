package com.example.planner.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.planner.PlannerViewModel
import com.example.planner.data.Project
import com.example.planner.ui.*

@Composable
fun ProjectsScreen(vm: PlannerViewModel) {
    val projects by vm.projects.collectAsState()
    var showDialog by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(contentPadding = PaddingValues(bottom = 88.dp)) {
            item { PlannerScreenHeader("پروژه‌ها", todayJalaliLabel()) }
            if (projects.isEmpty()) item { EmptyHint("پروژه بساز تا ایده‌هات جدی بشن") }
            items(projects, key = { it.id }) { p ->
                ProjectCard(vm, p)
            }
        }
        Box(modifier = Modifier.align(Alignment.BottomEnd).padding(20.dp)) {
            AddFloatingButton { showDialog = true }
        }
    }
    if (showDialog) NewProjectDialog(
        onDismiss = { showDialog = false },
        onSave = { t, d -> vm.addProject(t, d, 0); showDialog = false }
    )
}

@Composable
private fun ProjectCard(vm: PlannerViewModel, p: Project) {
    var expanded by remember { mutableStateOf(false) }
    val ptasks by vm.projectTasks(p.id).collectAsState()
    val total = ptasks.size
    val done = ptasks.count { it.done }
    val pct = if (total == 0) 0 else done * 100 / total

    AppCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f).clickable { expanded = !expanded }) {
                Text(p.title, style = MaterialTheme.typography.titleMedium, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold)
                if (p.description.isNotEmpty()) Text(p.description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.height(6.dp))
                LinearProgressIndicator(
                    progress = { pct / 100f },
                    modifier = Modifier.fillMaxWidth().height(8.dp),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
                Text("$done / $total", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            IconButton(onClick = { expanded = !expanded }) { Icon(if (expanded) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore, "باز/بسته") }
            IconButton(onClick = { vm.deleteProject(p) }) { Icon(Icons.Filled.Delete, "حذف", tint = MaterialTheme.colorScheme.error) }
        }
        if (expanded) {
            Spacer(Modifier.height(8.dp))
            var newTask by remember { mutableStateOf("") }
            Row(verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(newTask, { newTask = it }, label = { Text("کار جدید") }, singleLine = true, modifier = Modifier.weight(1f))
                TextButton(onClick = { if (newTask.isNotBlank()) { vm.addProjectTask(p.id, newTask.trim()); newTask = "" } }) { Text("افزودن") }
            }
            if (ptasks.isEmpty()) Text("هنوز کاری نداره", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            ptasks.forEach { t ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = t.done, onCheckedChange = { vm.toggleProjectTask(t) })
                    Text(t.title, color = if (t.done) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface)
                }
            }
        }
    }
}

@Composable
private fun NewProjectDialog(onDismiss: () -> Unit, onSave: (String, String) -> Unit) {
    var title by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("پروژه جدید") },
        text = {
            Column {
                OutlinedTextField(title, { title = it }, label = { Text("عنوان") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(desc, { desc = it }, label = { Text("توضیح") }, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = { TextButton(onClick = { if (title.isNotBlank()) onSave(title.trim(), desc.trim()) }) { Text("ساخت") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("انصراف") } }
    )
}
