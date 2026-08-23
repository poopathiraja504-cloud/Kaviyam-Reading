package com.example.kaviyam.data.repository

import com.example.kaviyam.data.local.InitialData
import com.example.kaviyam.data.local.KaviyamDao
import com.example.kaviyam.data.models.Book
import com.example.kaviyam.data.models.Chapter
import com.example.kaviyam.data.models.Review
import com.example.kaviyam.data.models.SecurityLog
import com.example.kaviyam.data.models.SimulatedEmail
import com.example.kaviyam.data.models.TamilAuthor
import com.example.kaviyam.data.models.TamilQuote
import com.example.kaviyam.data.models.UserProfile
import com.example.kaviyam.data.remote.GeminiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID

class KaviyamRepository(private val dao: KaviyamDao) {
    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }

    val allBooks: Flow<List<Book>> = dao.getAllBooks()
    val userProfile: Flow<UserProfile?> = dao.getUserProfile()
    val securityLogs: Flow<List<SecurityLog>> = dao.getAllSecurityLogs()
    val emails: Flow<List<SimulatedEmail>> = dao.getAllEmails()

    val tamilQuotes: List<TamilQuote> = InitialData.TAMIL_QUOTES
    val tamilAuthors: List<TamilAuthor> = InitialData.TAMIL_AUTHORS

    suspend fun getBookById(id: String): Book? = dao.getBookById(id)
    fun getBookFlow(id: String): Flow<Book?> = dao.getBookFlow(id)

    suspend fun toggleBookmark(book: Book) = withContext(Dispatchers.IO) {
        val newBookmarkState = !book.isBookmarked
        dao.setBookmark(book.id, newBookmarkState)
        logSecurityAction("Bookmark Updated: ${book.title} (${if (newBookmarkState) "Saved" else "Removed"})", "Success")
    }

    suspend fun updateReadingProgress(bookId: String, progress: Int, chapterIndex: Int) = withContext(Dispatchers.IO) {
        dao.updateReadingProgress(bookId, progress, chapterIndex)
    }

    suspend fun addReview(bookId: String, rating: Int, comment: String, username: String) = withContext(Dispatchers.IO) {
        val book = dao.getBookById(bookId) ?: return@withContext
        val currentReviews: MutableList<Review> = try {
            json.decodeFromString<List<Review>>(book.reviewsJson).toMutableList()
        } catch (_: Exception) {
            mutableListOf()
        }

        val newReview = Review(
            id = "rev-${UUID.randomUUID()}",
            username = username.ifBlank { "Reader" },
            rating = rating,
            comment = comment,
            date = "Just now"
        )
        currentReviews.add(0, newReview)

        val updatedReviewsJson = json.encodeToString(currentReviews)
        val newRating = ((book.rating * 10 + rating) / 11.0).coerceIn(1.0, 5.0)
        val updatedBook = book.copy(
            reviewsJson = updatedReviewsJson,
            rating = (Math.round(newRating * 10.0) / 10.0)
        )
        dao.updateBook(updatedBook)
        logSecurityAction("Book Review Published for '${book.title}'", "Success")
    }

    suspend fun createAiNovel(
        title: String,
        author: String,
        genre: String,
        prompt: String,
        coverImage: String
    ): Book = withContext(Dispatchers.IO) {
        val (description, chapters) = GeminiClient.generateAiNovel(title, author, genre, prompt)

        val newBook = Book(
            id = "book-ai-${UUID.randomUUID().toString().take(8)}",
            title = title,
            author = author.ifBlank { "Kaviyam AI Scribe" },
            genre = genre,
            year = 2026,
            rating = 5.0,
            reads = 1,
            description = description,
            language = "Tamil & English",
            coverImage = coverImage.ifBlank { "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600" },
            isCustomAI = true,
            isTamilClassic = false,
            chaptersJson = json.encodeToString(chapters),
            reviewsJson = json.encodeToString(listOf(
                Review(
                    id = "rev-ai-init",
                    username = "Kaviyam AI Critic",
                    rating = 5,
                    comment = "Brilliantly synthesized narrative that opens with captivating character dynamics and vivid prose.",
                    date = "Today"
                )
            )),
            tagsJson = json.encodeToString(listOf("AI Generated", genre, "Original")),
            isBookmarked = true,
            progressPercentage = 0,
            lastReadChapterIndex = 0
        )

        dao.insertBook(newBook)
        logSecurityAction("AI Novel Generated & Compiled: '$title'", "Success")
        
        // Dispatch simulated confirmation email
        sendSimulatedEmail(
            recipient = "rajaboopathi1021@gmail.com",
            subject = "AI Novel Published: $title 📖",
            body = "Your original story '$title' in the $genre genre has been compiled and added to your Kaviyam Bookshelf with ${chapters.size} full chapters.",
            category = "System"
        )

        newBook
    }

    suspend fun deleteBook(bookId: String) = withContext(Dispatchers.IO) {
        dao.deleteBook(bookId)
        logSecurityAction("Book Removed from Library (ID: $bookId)", "Success")
    }

    suspend fun updateUserProfile(profile: UserProfile) = withContext(Dispatchers.IO) {
        dao.saveUserProfile(profile)
        logSecurityAction("User Profile Updated: ${profile.penName}", "Success")
    }

    suspend fun logSecurityAction(action: String, status: String = "Success") = withContext(Dispatchers.IO) {
        val log = SecurityLog(
            id = "log-${UUID.randomUUID()}",
            action = action,
            timestamp = System.currentTimeMillis(),
            status = status
        )
        dao.insertSecurityLog(log)
    }

    suspend fun sendSimulatedEmail(recipient: String, subject: String, body: String, category: String = "Security") = withContext(Dispatchers.IO) {
        val email = SimulatedEmail(
            id = "em-${UUID.randomUUID()}",
            recipient = recipient,
            subject = subject,
            body = body,
            sentAt = System.currentTimeMillis(),
            read = false,
            category = category
        )
        dao.insertEmail(email)
    }

    suspend fun markEmailRead(emailId: String) = withContext(Dispatchers.IO) {
        dao.markEmailRead(emailId)
    }

    suspend fun deleteEmail(emailId: String) = withContext(Dispatchers.IO) {
        dao.deleteEmail(emailId)
    }

    suspend fun askCompanion(book: Book, chapter: Chapter, query: String, history: List<Pair<String, String>>): String {
        return GeminiClient.askCompanion(
            bookTitle = book.title,
            chapterTitle = chapter.title,
            chapterText = chapter.content,
            userQuery = query,
            chatHistory = history
        )
    }
}
