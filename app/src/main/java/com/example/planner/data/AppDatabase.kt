package com.example.planner.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        Idea::class, Project::class, ProjectTask::class,
        Habit::class, HabitLog::class, Task::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun ideaDao(): IdeaDao
    abstract fun projectDao(): ProjectDao
    abstract fun projectTaskDao(): ProjectTaskDao
    abstract fun habitDao(): HabitDao
    abstract fun taskDao(): TaskDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null
        fun get(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "planner.db"
                ).build().also { INSTANCE = it }
            }
        }
    }
}
