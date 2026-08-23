package com.example.kaviyam.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.kaviyam.KaviyamApplication
import com.example.kaviyam.data.models.Book
import com.example.kaviyam.data.models.Chapter
import com.example.kaviyam.data.models.Review
import com.example.kaviyam.data.models.SecurityLog
import com.example.kaviyam.data.models.SimulatedEmail
import com.example.kaviyam.data.models.TamilAuthor
import com.example.kaviyam.data.models.TamilQuote
import com.example.kaviyam.data.models.UserProfile
import com.example.kaviyam.data.repository.KaviyamRepository
import com.example.kaviyam.util.KaviyamTts
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json

enum class ReaderTheme {
    MIDNIGHT,
    PARCHMENT,
    SEPIA
}

enum class ReaderFontFamily {
    SERIF,
    SANS_SERIF,
    MONOSPACE
}

data class ReaderSettings(
    val theme: ReaderTheme = ReaderTheme.MIDNIGHT,
    val fontSizeSp: Float = 17f,
    val lineHeightMultiplier: Float = 1.6f,
    val fontFamily: ReaderFontFamily = ReaderFontFamily.SERIF
)

data class CompanionMessage(
    val isUser: Boolean,
    val text: String,
    val timestamp: Long = System.currentTimeMillis()
)

class KaviyamViewModel(application: Application) : AndroidViewModel(application) {
    private val repository: KaviyamRepository = (application as KaviyamApplication).repository
    val tts = KaviyamTts(application)
    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }

    // Books & Filter state
    val allBooks: StateFlow<List<Book>> = repository.allBooks
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val userProfile: StateFlow<UserProfile?> = repository.userProfile
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val securityLogs: StateFlow<List<SecurityLog>> = repository.securityLogs
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val emails: StateFlow<List<SimulatedEmail>> = repository.emails
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val tamilQuotes: List<TamilQuote> = repository.tamilQuotes
    val tamilAuthors: List<TamilAuthor> = repository.tamilAuthors

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedGenre = MutableStateFlow("All")
    val selectedGenre: StateFlow<String> = _selectedGenre.asStateFlow()

    // Filtered books stream
    val filteredBooks: StateFlow<List<Book>> = combine(
        allBooks,
        _searchQuery,
        _selectedGenre
    ) { books, query, genre ->
        books.filter { book ->
            val matchesQuery = query.isBlank() ||
                    book.title.contains(query, ignoreCase = true) ||
                    (book.tamilTitle?.contains(query, ignoreCase = true) == true) ||
                    book.author.contains(query, ignoreCase = true) ||
                    book.description.contains(query, ignoreCase = true)

            val matchesGenre = when (genre) {
                "All" -> true
                "Bookmarks" -> book.isBookmarked
                "Tamil Classics" -> book.isTamilClassic || book.genre == "Tamil Classics"
                "AI Generated" -> book.isCustomAI
                else -> book.genre.equals(genre, ignoreCase = true)
            }

            matchesQuery && matchesGenre
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Active Book & Active Chapter in Reader
    private val _activeBook = MutableStateFlow<Book?>(null)
    val activeBook: StateFlow<Book?> = _activeBook.asStateFlow()

    private val _activeChapterIndex = MutableStateFlow(0)
    val activeChapterIndex: StateFlow<Int> = _activeChapterIndex.asStateFlow()

    // Reader Settings
    private val _readerSettings = MutableStateFlow(ReaderSettings())
    val readerSettings: StateFlow<ReaderSettings> = _readerSettings.asStateFlow()

    // AI Companion in Reader
    private val _companionMessages = MutableStateFlow<List<CompanionMessage>>(
        listOf(
            CompanionMessage(
                isUser = false,
                text = "Vanakkam! I am your Kaviyam AI Literary Companion. Ask me anything about character backgrounds, Sangam history, plot developments, or linguistic nuances in this chapter."
            )
        )
    )
    val companionMessages: StateFlow<List<CompanionMessage>> = _companionMessages.asStateFlow()

    private val _isCompanionThinking = MutableStateFlow(false)
    val isCompanionThinking: StateFlow<Boolean> = _isCompanionThinking.asStateFlow()

    // AI Novel Builder Form State
    private val _isGeneratingNovel = MutableStateFlow(false)
    val isGeneratingNovel: StateFlow<Boolean> = _isGeneratingNovel.asStateFlow()

    private val _novelGenerationStatus = MutableStateFlow("")
    val novelGenerationStatus: StateFlow<String> = _novelGenerationStatus.asStateFlow()

    // Toast/Banner Messages
    private val _userMessage = MutableStateFlow<String?>(null)
    val userMessage: StateFlow<String?> = _userMessage.asStateFlow()

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setSelectedGenre(genre: String) {
        _selectedGenre.value = genre
    }

    fun openReader(book: Book, startChapterIndex: Int = 0) {
        _activeBook.value = book
        _activeChapterIndex.value = startChapterIndex.coerceIn(0, (getChapters(book).size - 1).coerceAtLeast(0))
        _companionMessages.value = listOf(
            CompanionMessage(
                isUser = false,
                text = "Vanakkam! Welcome to '${book.title}'. I am ready to explore this chapter with you. Tap any quick question below or ask freely!"
            )
        )
        tts.stop()
    }

    fun closeReader() {
        _activeBook.value = null
        tts.stop()
    }

    fun nextChapter() {
        val book = _activeBook.value ?: return
        val chapters = getChapters(book)
        if (_activeChapterIndex.value < chapters.size - 1) {
            _activeChapterIndex.value += 1
            updateReadingProgress()
            tts.stop()
        }
    }

    fun previousChapter() {
        if (_activeChapterIndex.value > 0) {
            _activeChapterIndex.value -= 1
            updateReadingProgress()
            tts.stop()
        }
    }

    fun setChapterIndex(index: Int) {
        val book = _activeBook.value ?: return
        val chapters = getChapters(book)
        if (index in chapters.indices) {
            _activeChapterIndex.value = index
            updateReadingProgress()
            tts.stop()
        }
    }

    private fun updateReadingProgress() {
        val book = _activeBook.value ?: return
        val chapters = getChapters(book)
        if (chapters.isEmpty()) return
        val progress = ((_activeChapterIndex.value + 1) * 100) / chapters.size
        viewModelScope.launch {
            repository.updateReadingProgress(book.id, progress, _activeChapterIndex.value)
        }
    }

    fun toggleBookmark(book: Book) {
        viewModelScope.launch {
            repository.toggleBookmark(book)
            if (_activeBook.value?.id == book.id) {
                _activeBook.value = _activeBook.value?.copy(isBookmarked = !book.isBookmarked)
            }
        }
    }

    fun addReview(bookId: String, rating: Int, comment: String, username: String) {
        viewModelScope.launch {
            repository.addReview(bookId, rating, comment, username)
            _userMessage.value = "Review published successfully!"
        }
    }

    fun updateReaderTheme(theme: ReaderTheme) {
        _readerSettings.value = _readerSettings.value.copy(theme = theme)
    }

    fun updateFontSize(delta: Float) {
        val newSize = (_readerSettings.value.fontSizeSp + delta).coerceIn(12f, 28f)
        _readerSettings.value = _readerSettings.value.copy(fontSizeSp = newSize)
    }

    fun updateFontFamily(family: ReaderFontFamily) {
        _readerSettings.value = _readerSettings.value.copy(fontFamily = family)
    }

    fun updateLineHeight(multiplier: Float) {
        _readerSettings.value = _readerSettings.value.copy(lineHeightMultiplier = multiplier)
    }

    fun readCurrentChapterAloud() {
        val book = _activeBook.value ?: return
        val chapters = getChapters(book)
        val currentChapter = chapters.getOrNull(_activeChapterIndex.value) ?: return

        if (tts.isPlaying.value) {
            tts.stop()
        } else {
            val isTamil = book.isTamilClassic || currentChapter.content.any { it.code in 0x0B80..0x0BFF }
            tts.speak(currentChapter.content, isTamil = isTamil)
        }
    }

    fun askCompanion(query: String) {
        val book = _activeBook.value ?: return
        val chapters = getChapters(book)
        val currentChapter = chapters.getOrNull(_activeChapterIndex.value) ?: return

        val userMsg = CompanionMessage(isUser = true, text = query)
        _companionMessages.value = _companionMessages.value + userMsg
        _isCompanionThinking.value = true

        viewModelScope.launch {
            val history = _companionMessages.value.filter { it.text.isNotBlank() }
                .zipWithNext()
                .filter { it.first.isUser && !it.second.isUser }
                .map { Pair(it.first.text, it.second.text) }

            val responseText = repository.askCompanion(book, currentChapter, query, history)
            _companionMessages.value = _companionMessages.value + CompanionMessage(isUser = false, text = responseText)
            _isCompanionThinking.value = false
        }
    }

    fun generateAiNovel(
        title: String,
        author: String,
        genre: String,
        prompt: String,
        coverImage: String,
        onComplete: (Book) -> Unit
    ) {
        if (title.isBlank() || prompt.isBlank()) {
            _userMessage.value = "Please provide both a title and story prompt."
            return
        }

        _isGeneratingNovel.value = true
        _novelGenerationStatus.value = "Synthesizing plot threads & crafting chapters with Gemini..."

        viewModelScope.launch {
            try {
                val createdBook = repository.createAiNovel(
                    title = title,
                    author = author,
                    genre = genre,
                    prompt = prompt,
                    coverImage = coverImage
                )
                _isGeneratingNovel.value = false
                _novelGenerationStatus.value = "Story synthesized and published to your Bookshelf!"
                _userMessage.value = "Novel '$title' compiled successfully!"
                onComplete(createdBook)
            } catch (e: Exception) {
                _isGeneratingNovel.value = false
                _novelGenerationStatus.value = "Generation failed: ${e.message}"
                _userMessage.value = "Failed to generate novel."
            }
        }
    }

    fun markEmailRead(id: String) {
        viewModelScope.launch {
            repository.markEmailRead(id)
        }
    }

    fun deleteEmail(id: String) {
        viewModelScope.launch {
            repository.deleteEmail(id)
        }
    }

    fun triggerEmailAction(action: String, params: Map<String, String>) {
        viewModelScope.launch {
            when (action) {
                "VerifyEmail" -> {
                    val profile = userProfile.value ?: UserProfile()
                    repository.updateUserProfile(profile.copy(isVerified = true))
                    repository.logSecurityAction("Email Address Verified (${params["email"] ?: profile.email})", "Success")
                    _userMessage.value = "Email address successfully verified!"
                }
                "ResetPassword" -> {
                    repository.logSecurityAction("Password Reset Protocol Verified (Token: ${params["token"]})", "Success")
                    _userMessage.value = "Password reset authenticated successfully!"
                }
            }
        }
    }

    fun toggle2FA() {
        val profile = userProfile.value ?: UserProfile()
        val newState = !profile.is2FAEnabled
        viewModelScope.launch {
            repository.updateUserProfile(profile.copy(is2FAEnabled = newState))
            repository.logSecurityAction("Two-Factor Authentication ${if (newState) "Activated" else "Deactivated"}", "Success")
            _userMessage.value = "2FA ${if (newState) "Enabled" else "Disabled"}"
        }
    }

    fun updateProfileInfo(penName: String, bio: String) {
        val profile = userProfile.value ?: UserProfile()
        viewModelScope.launch {
            repository.updateUserProfile(profile.copy(penName = penName, bio = bio))
            _userMessage.value = "Profile updated!"
        }
    }

    fun clearUserMessage() {
        _userMessage.value = null
    }

    fun getChapters(book: Book): List<Chapter> {
        return try {
            json.decodeFromString<List<Chapter>>(book.chaptersJson)
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun getReviews(book: Book): List<Review> {
        return try {
            json.decodeFromString<List<Review>>(book.reviewsJson)
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun getTags(book: Book): List<String> {
        return try {
            json.decodeFromString<List<String>>(book.tagsJson)
        } catch (_: Exception) {
            emptyList()
        }
    }

    override fun onCleared() {
        super.onCleared()
        tts.shutdown()
    }
}
