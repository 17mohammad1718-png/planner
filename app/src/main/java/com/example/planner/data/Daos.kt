package com.example.planner.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface IdeaDao {
    @Query("SELECT * FROM ideas ORDER BY updatedAt DESC")
    fun getAll(): Flow<List<Idea>>
    @Query("SELECT * FROM ideas WHERE id = :id")
    suspend fun byId(id: Long): Idea?
    @Insert suspend fun insert(i: Idea): Long
    @Update suspend fun update(i: Idea)
    @Delete suspend fun delete(i: Idea)
}

@Dao
interface ProjectDao {
    @Query("SELECT * FROM projects ORDER BY createdAt DESC")
    fun getAll(): Flow<List<Project>>
    @Query("SELECT * FROM projects WHERE id = :id")
    suspend fun byId(id: Long): Project?
    @Insert suspend fun insert(p: Project): Long
    @Update suspend fun update(p: Project)
    @Delete suspend fun delete(p: Project)
}

@Dao
interface ProjectTaskDao {
    @Query("SELECT * FROM project_tasks WHERE projectId = :pid ORDER BY createdAt ASC")
    fun forProject(pid: Long): Flow<List<ProjectTask>>
    @Insert suspend fun insert(t: ProjectTask): Long
    @Update suspend fun update(t: ProjectTask)
    @Delete suspend fun delete(t: ProjectTask)
}

@Dao
interface HabitDao {
    @Query("SELECT * FROM habits ORDER BY createdAt ASC")
    fun getAll(): Flow<List<Habit>>
    @Query("SELECT * FROM habit_logs WHERE habitId = :habitId")
    fun logsFor(habitId: Long): Flow<List<HabitLog>>
    @Query("SELECT * FROM habit_logs WHERE habitId = :habitId AND date IN (:dates)")
    suspend fun logsForDates(habitId: Long, dates: List<String>): List<HabitLog>
    @Insert suspend fun insert(h: Habit): Long
    @Delete suspend fun delete(h: Habit)
    @Insert suspend fun insertLog(l: HabitLog)
    @Query("DELETE FROM habit_logs WHERE habitId=:habitId")
    suspend fun clearLogs(habitId: Long)
    @Query("DELETE FROM habit_logs WHERE habitId=:habitId AND date=:dateKey")
    suspend fun deleteLog(habitId: Long, dateKey: String)
}

@Dao
interface TaskDao {
    @Query("SELECT * FROM tasks ORDER BY date DESC, time DESC")
    fun getAll(): Flow<List<Task>>
    @Query("SELECT * FROM tasks WHERE date = :date")
    fun forDate(date: String): Flow<List<Task>>
    @Query("SELECT * FROM tasks WHERE date = :date")
    suspend fun byDate(date: String): List<Task>
    @Insert suspend fun insert(t: Task): Long
    @Update suspend fun update(t: Task)
    @Delete suspend fun delete(t: Task)
}
