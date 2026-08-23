package com.example.kaviyam

import android.app.Application
import com.example.kaviyam.data.local.KaviyamDatabase
import com.example.kaviyam.data.repository.KaviyamRepository

class KaviyamApplication : Application() {
    val database: KaviyamDatabase by lazy { KaviyamDatabase.getDatabase(this) }
    val repository: KaviyamRepository by lazy { KaviyamRepository(database.kaviyamDao()) }

    override fun onCreate() {
        super.onCreate()
    }
}
