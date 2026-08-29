package com.example.planner

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.planner.data.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class PlannerViewModel(app: Application) : AndroidViewModel(app) {

    private val db = AppDatabase.get(app)
    private val ideaDao = db.ideaDao()
    private val projectDao = db.projectDao()
    private val ptaskDao = db.projectTaskDao()
    private val habitDao = db.habitDao()
    private val taskDao = db.taskDao()

    private fun <T> sflow(src: Flow<T>, empty: T): StateFlow<T> =
        src.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), empty)

    val ideas: StateFlow<List<Idea>> = sflow(ideaDao.getAll(), emptyList())
    val projects: StateFlow<List<Project>> = sflow(projectDao.getAll(), emptyList())
    val habits: StateFlow<List<Habit>> = sflow(habitDao.getAll(), emptyList())
    val tasks: StateFlow<List<Task>> = sflow(taskDao.getAll(), emptyList())

    fun projectTasks(pid: Long): StateFlow<List<ProjectTask>> =
        sflow(ptaskDao.forProject(pid), emptyList())

    fun habitLogs(hid: Long): StateFlow<List<HabitLog>> =
        sflow(habitDao.logsFor(hid), emptyList())

    // --- ideas ------------------------------------------------------------
    fun addIdea(title: String, description: String, tags: String) {
        viewModelScope.launch { ideaDao.insert(Idea(title = title, description = description, tags = tags)) }
    }
    fun updateIdeaStatus(id: Long, status: String) {
        viewModelScope.launch {
            val item = ideaDao.byId(id) ?: return@launch
            ideaDao.update(item.copy(status = status, updatedAt = System.currentTimeMillis()))
        }
    }
    fun deleteIdea(i: Idea) { viewModelScope.launch { ideaDao.delete(i) } }

    // --- projects -----------------------------------------------------------
    fun addProject(title: String, description: String, deadline: Long) {
        viewModelScope.launch { projectDao.insert(Project(title = title, description = description, deadline = deadline)) }
    }
    fun addProjectTask(pid: Long, title: String) {
        viewModelScope.launch { ptaskDao.insert(ProjectTask(projectId = pid, title = title)) }
    }
    fun toggleProjectTask(t: ProjectTask) {
        viewModelScope.launch { ptaskDao.update(t.copy(done = !t.done)) }
    }
    fun deleteProject(p: Project) { viewModelScope.launch { projectDao.delete(p) } }

    // --- habits ---------------------------------------------------------------
    fun addHabit(title: String, icon: String, color: Long) {
        viewModelScope.launch { habitDao.insert(Habit(title = title, icon = icon, color = color)) }
    }
    fun toggleHabitDay(h: Habit, dateKey: String) {
        viewModelScope.launch {
            val existing = habitDao.logsForDates(h.id, listOf(dateKey))
            if (existing.isEmpty()) habitDao.insertLog(HabitLog(habitId = h.id, date = dateKey))
            else habitDao.deleteLog(h.id, dateKey)
        }
    }
    fun deleteHabit(h: Habit) {
        viewModelScope.launch { habitDao.clearLogs(h.id); habitDao.delete(h) }
    }

    // --- tasks -----------------------------------------------------------------
    fun addTask(t: Task) { viewModelScope.launch { taskDao.insert(t) } }
    fun toggleTask(t: Task) { viewModelScope.launch { taskDao.update(t.copy(done = !t.done)) } }
    fun deleteTask(t: Task) { viewModelScope.launch { taskDao.delete(t) } }
}
