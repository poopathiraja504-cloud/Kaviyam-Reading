package com.example.kaviyam.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.kaviyam.data.models.Book
import com.example.kaviyam.data.models.SecurityLog
import com.example.kaviyam.data.models.SimulatedEmail
import com.example.kaviyam.data.models.UserProfile
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        Book::class,
        UserProfile::class,
        SecurityLog::class,
        SimulatedEmail::class
    ],
    version = 1,
    exportSchema = false
)
abstract class KaviyamDatabase : RoomDatabase() {
    abstract fun kaviyamDao(): KaviyamDao

    companion object {
        @Volatile
        private var INSTANCE: KaviyamDatabase? = null

        fun getDatabase(context: Context): KaviyamDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    KaviyamDatabase::class.java,
                    "kaviyam_reading_db"
                )
                    .addCallback(object : Callback() {
                        override fun onCreate(db: SupportSQLiteDatabase) {
                            super.onCreate(db)
                            // Populate initial database on first launch
                            CoroutineScope(Dispatchers.IO).launch {
                                val dao = getDatabase(context).kaviyamDao()
                                dao.insertBooks(InitialData.getInitialBooks())
                                dao.saveUserProfile(UserProfile())
                                dao.insertSecurityLogs(InitialData.INITIAL_SECURITY_LOGS)
                                dao.insertEmails(InitialData.INITIAL_EMAILS)
                            }
                        }
                    })
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
