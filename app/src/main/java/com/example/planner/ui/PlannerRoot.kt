package com.example.planner.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.automirrored.filled.Checklist
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.planner.PlannerViewModel
import com.example.planner.ui.screens.CalendarScreen
import com.example.planner.ui.screens.HabitsScreen
import com.example.planner.ui.screens.IdeasScreen
import com.example.planner.ui.screens.ProjectsScreen
import com.example.planner.ui.screens.TasksScreen

private data class Tab(val route: String, val label: String, val icon: ImageVector)

private val Tabs = listOf(
    Tab("ideas", "ایده‌ها", Icons.Filled.Lightbulb),
    Tab("projects", "پروژه‌ها", Icons.Filled.Folder),
    Tab("tasks", "کارها", Icons.AutoMirrored.Filled.Checklist),
    Tab("habits", "عادت‌ها", Icons.Filled.Favorite),
    Tab("calendar", "تقویم", Icons.Filled.DateRange)
)

@Composable
fun PlannerRoot(nav: NavHostController, currentRoute: String, vm: PlannerViewModel) {
    Scaffold(
        bottomBar = {
            NavigationBar {
                Tabs.forEach { tab ->
                    NavigationBarItem(
                        selected = currentRoute == tab.route,
                        onClick = { nav.navigate(tab.route) { launchSingleTop = true; popUpTo("tasks") { saveState = true } } },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label) }
                    )
                }
            }
        }
    ) { padding ->
        NavHost(navController = nav, startDestination = "tasks", modifier = Modifier.padding(padding)) {
            composable("ideas") { IdeasScreen(vm) }
            composable("projects") { ProjectsScreen(vm) }
            composable("tasks") { TasksScreen(vm) }
            composable("habits") { HabitsScreen(vm) }
            composable("calendar") { CalendarScreen(vm) }
        }
    }
}
