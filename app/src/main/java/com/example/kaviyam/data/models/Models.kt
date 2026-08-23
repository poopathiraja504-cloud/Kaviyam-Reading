package com.example.kaviyam.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "books")
data class Book(
    @PrimaryKey val id: String,
    val title: String,
    val tamilTitle: String? = null,
    val author: String,
    val genre: String,
    val year: Int,
    val rating: Double,
    val reads: Int,
    val description: String,
    val language: String,
    val coverImage: String,
    val isCustomAI: Boolean = false,
    val isTamilClassic: Boolean = false,
    val chaptersJson: String = "[]", // Serialized List<Chapter>
    val reviewsJson: String = "[]",   // Serialized List<Review>
    val tagsJson: String = "[]",      // Serialized List<String>
    val isBookmarked: Boolean = false,
    val progressPercentage: Int = 0,
    val lastReadChapterIndex: Int = 0,
    val lastReadTimestamp: Long = System.currentTimeMillis()
)

@Serializable
data class Chapter(
    val id: String,
    val number: Int,
    val title: String,
    val tamilTitle: String? = null,
    val content: String,
    val audioAvailable: Boolean = true
)

@Serializable
data class Review(
    val id: String,
    val username: String,
    val rating: Int,
    val comment: String,
    val date: String,
    val avatar: String = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
)

@Serializable
@Entity(tableName = "user_profile")
data class UserProfile(
    @PrimaryKey val id: String = "default_user",
    val penName: String = "Boopathi Raja",
    val email: String = "rajaboopathi1021@gmail.com",
    val bio: String = "Passionate Tamil literature explorer, classical historical novel aficionado & AI storyteller.",
    val profilePhoto: String = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    val dailyGoalMinutes: Int = 30,
    val currentDayMinutes: Int = 18,
    val booksReadGoal: Int = 12,
    val booksCompleted: Int = 7,
    val currentStreak: Int = 14,
    val totalReadMinutes: Int = 420,
    val is2FAEnabled: Boolean = false,
    val isVerified: Boolean = true,
    val isBlocked: Boolean = false,
    val favoriteGenresJson: String = "[\"Tamil Classics\", \"Historical Fiction\", \"Sci-Fi\"]"
)

@Serializable
data class Achievement(
    val id: String,
    val title: String,
    val description: String,
    val icon: String,
    val isUnlocked: Boolean,
    val unlockedDate: String? = null
)

@Serializable
@Entity(tableName = "security_logs")
data class SecurityLog(
    @PrimaryKey val id: String,
    val action: String,
    val timestamp: Long = System.currentTimeMillis(),
    val device: String = "Android Mobile (ARM64)",
    val ip: String = "192.168.1.42 (Encrypted)",
    val status: String = "Success" // "Success", "Failed", "Blocked"
)

@Serializable
@Entity(tableName = "simulated_emails")
data class SimulatedEmail(
    @PrimaryKey val id: String,
    val recipient: String,
    val subject: String,
    val body: String,
    val sentAt: Long = System.currentTimeMillis(),
    val read: Boolean = false,
    val category: String = "Security" // "Auth", "Security", "System", "Newsletter"
)

@Serializable
data class TamilQuote(
    val id: String,
    val kuralNumber: Int,
    val tamil: String,
    val transliteration: String,
    val english: String,
    val explanation: String,
    val author: String = "Thiruvalluvar"
)

@Serializable
data class TamilAuthor(
    val id: String,
    val name: String,
    val tamilName: String,
    val era: String,
    val bio: String,
    val notableWorks: List<String>,
    val image: String
)
