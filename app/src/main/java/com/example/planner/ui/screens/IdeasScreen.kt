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
import androidx.compose.ui.unit.dp
import com.example.planner.PlannerViewModel
import com.example.planner.data.Idea
import com.example.planner.ui.*

private val STATUSES = listOf("raw" to "خام", "review" to "در بررسی", "started" to "شروع شده", "archived" to "آرشیو")

@Composable
fun IdeasScreen(vm: PlannerViewModel) {
    val ideas by vm.ideas.collectAsState()
    var showDialog by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(contentPadding = PaddingValues(bottom = 88.dp)) {
            item { PlannerScreenHeader("ایده‌ها", todayJalaliLabel()) }
            if (ideas.isEmpty()) item { EmptyHint("هنوز ایده‌ای ثبت نکرده‌ای") }
            items(ideas, key = { it.id }) { idea ->
                IdeaCard(idea, onStatus = { vm.updateIdeaStatus(idea.id, it) }, onDelete = { vm.deleteIdea(idea) })
            }
        }
        Box(modifier = Modifier.align(Alignment.BottomEnd).padding(20.dp)) {
            AddFloatingButton { showDialog = true }
        }
    }

    if (showDialog) NewIdeaDialog(
        onDismiss = { showDialog = false },
        onSave = { t, d, tags -> vm.addIdea(t, d, tags); showDialog = false }
    )
}

@Composable
private fun IdeaCard(idea: Idea, onStatus: (String) -> Unit, onDelete: () -> Unit) {
    AppCard {
        Row(verticalAlignment = Alignment.Top) {
            Column(modifier = Modifier.weight(1f)) {
                Text(idea.title, style = MaterialTheme.typography.titleMedium, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold)
                if (idea.description.isNotEmpty()) {
                    Text(idea.description, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Spacer(Modifier.height(8.dp))
                Row {
                    STATUSES.forEach { (key, label) ->
                        StatusChip(label, active = idea.status == key, onClick = { onStatus(key) })
                        Spacer(Modifier.width(6.dp))
                    }
                }
            }
            IconButton(onClick = onDelete) { Icon(Icons.Filled.Delete, "حذف", tint = MaterialTheme.colorScheme.error) }
        }
    }
}

@Composable
private fun NewIdeaDialog(onDismiss: () -> Unit, onSave: (String, String, String) -> Unit) {
    var title by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }
    var tags by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("ایده جدید") },
        text = {
            Column {
                OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("عنوان") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = desc, onValueChange = { desc = it }, label = { Text("توضیح") }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = tags, onValueChange = { tags = it }, label = { Text("تگ‌ها (با کاما)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            TextButton(onClick = { if (title.isNotBlank()) onSave(title.trim(), desc.trim(), tags.trim()) }) { Text("ذخیره") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("انصراف") } }
    )
}
