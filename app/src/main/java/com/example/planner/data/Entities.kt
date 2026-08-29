package com.example.planner.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "ideas")
data class Idea(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val description: String = "",
    val tags: String = "",
    val status: String = "raw", // raw | review | started | archived
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "projects")
data class Project(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val description: String = "",
    val deadline: Long = 0,
    val progress: Int = 0, // 0..100
    val status: String = "open",
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "project_tasks")
data class ProjectTask(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val projectId: Long,
    val title: String,
    val done: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "habits")
data class Habit(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val icon: String = "star",
    val color: Long = 0xFF5B8DEF,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "habit_logs")
data class HabitLog(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val habitId: Long,
    val date: String, // yyyy-MM-dd
    val done: Boolean = true
)

@Entity(tableName = "tasks")
data class Task(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val description: String = "",
    val date: String = "", // yyyy-MM-dd (empty = no date)
    val time: String = "", // HH:mm
    val repeat: String = "none", // none | daily | weekly | custom
    val priority: String = "normal", // low | normal | high
    val done: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
