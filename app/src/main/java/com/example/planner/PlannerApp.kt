package com.example.planner

import android.app.Application
import com.example.planner.data.AppDatabase

class PlannerApp : Application() {
    val database: AppDatabase by lazy { AppDatabase.get(this) }
}
