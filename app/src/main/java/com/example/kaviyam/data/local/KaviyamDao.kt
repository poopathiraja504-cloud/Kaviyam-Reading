package com.example.kaviyam.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.kaviyam.data.models.Book
import com.example.kaviyam.data.models.SecurityLog
import com.example.kaviyam.data.models.SimulatedEmail
import com.example.kaviyam.data.models.UserProfile
import kotlinx.coroutines.flow.Flow

@Dao
interface KaviyamDao {
    @Query("SELECT * FROM books ORDER BY isBookmarked DESC, lastReadTimestamp DESC")
    fun getAllBooks(): Flow<List<Book>>

    @Query("SELECT * FROM books WHERE id = :id")
    suspend fun getBookById(id: String): Book?

    @Query("SELECT * FROM books WHERE id = :id")
    fun getBookFlow(id: String): Flow<Book?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBook(book: Book)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBooks(books: List<Book>)

    @Update
    suspend fun updateBook(book: Book)

    @Query("DELETE FROM books WHERE id = :id")
    suspend fun deleteBook(id: String)

    @Query("UPDATE books SET isBookmarked = :isBookmarked WHERE id = :id")
    suspend fun setBookmark(id: String, isBookmarked: Boolean)

    @Query("UPDATE books SET progressPercentage = :progress, lastReadChapterIndex = :chapterIndex, lastReadTimestamp = :timestamp WHERE id = :id")
    suspend fun updateReadingProgress(id: String, progress: Int, chapterIndex: Int, timestamp: Long = System.currentTimeMillis())

    // User Profile
    @Query("SELECT * FROM user_profile WHERE id = 'default_user' LIMIT 1")
    fun getUserProfile(): Flow<UserProfile?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveUserProfile(profile: UserProfile)

    // Security Logs
    @Query("SELECT * FROM security_logs ORDER BY timestamp DESC")
    fun getAllSecurityLogs(): Flow<List<SecurityLog>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSecurityLog(log: SecurityLog)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSecurityLogs(logs: List<SecurityLog>)

    // Simulated Emails
    @Query("SELECT * FROM simulated_emails ORDER BY sentAt DESC")
    fun getAllEmails(): Flow<List<SimulatedEmail>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEmail(email: SimulatedEmail)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEmails(emails: List<SimulatedEmail>)

    @Query("UPDATE simulated_emails SET `read` = 1 WHERE id = :id")
    suspend fun markEmailRead(id: String)

    @Query("DELETE FROM simulated_emails WHERE id = :id")
    suspend fun deleteEmail(id: String)
}
