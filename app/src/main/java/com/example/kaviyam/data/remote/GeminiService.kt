package com.example.kaviyam.data.remote

import com.example.kaviyam.BuildConfig
import com.example.kaviyam.data.models.Chapter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

@Serializable
data class GenerateContentRequest(
    val contents: List<Content>,
    val generationConfig: GenerationConfig? = null,
    val systemInstruction: Content? = null
)

@Serializable
data class Content(
    val parts: List<Part>,
    val role: String? = null
)

@Serializable
data class Part(
    val text: String? = null
)

@Serializable
data class GenerationConfig(
    val temperature: Float? = 0.7f,
    val topP: Float? = 0.95f,
    val topK: Int? = 40
)

@Serializable
data class GenerateContentResponse(
    val candidates: List<Candidate>? = null
)

@Serializable
data class Candidate(
    val content: Content? = null
)

interface GeminiApiService {
    @POST("v1beta/models/gemini-3.5-flash:generateContent")
    suspend fun generateContent(
        @Query("key") apiKey: String,
        @Body request: GenerateContentRequest
    ): GenerateContentResponse
}

object GeminiClient {
    private const val BASE_URL = "https://generativelanguage.googleapis.com/"

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BASIC
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .addInterceptor(loggingInterceptor)
        .build()

    val service: GeminiApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(GeminiApiService::class.java)
    }

    suspend fun askCompanion(
        bookTitle: String,
        chapterTitle: String,
        chapterText: String,
        userQuery: String,
        chatHistory: List<Pair<String, String>> = emptyList()
    ): String = withContext(Dispatchers.IO) {
        val apiKey = try {
            BuildConfig.GEMINI_API_KEY
        } catch (_: Exception) {
            ""
        }

        if (apiKey.isNullOrBlank() || apiKey.startsWith("GEMINI_API_KEY")) {
            return@withContext getOfflineCompanionAnswer(bookTitle, chapterTitle, userQuery)
        }

        val systemPrompt = """
            You are 'Kaviyam AI Companion', an erudite scholar of Tamil literature and global literature.
            You are assisting a reader who is currently reading the book '$bookTitle', Chapter: '$chapterTitle'.
            Current chapter excerpt:
            ${chapterText.take(1500)}
            
            Be helpful, culturally rich, eloquent, and concise. Explain characters, historical context (Chola, Pallava, Sangam eras), plot themes, or linguistic terms clearly in English and Tamil.
        """.trimIndent()

        val contents = mutableListOf<Content>()
        chatHistory.takeLast(4).forEach { (q, a) ->
            contents.add(Content(parts = listOf(Part(text = q)), role = "user"))
            contents.add(Content(parts = listOf(Part(text = a)), role = "model"))
        }
        contents.add(Content(parts = listOf(Part(text = userQuery)), role = "user"))

        val request = GenerateContentRequest(
            contents = contents,
            generationConfig = GenerationConfig(temperature = 0.7f),
            systemInstruction = Content(parts = listOf(Part(text = systemPrompt)))
        )

        try {
            val response = service.generateContent(apiKey, request)
            response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                ?: getOfflineCompanionAnswer(bookTitle, chapterTitle, userQuery)
        } catch (e: Exception) {
            getOfflineCompanionAnswer(bookTitle, chapterTitle, userQuery)
        }
    }

    suspend fun generateAiNovel(
        title: String,
        author: String,
        genre: String,
        prompt: String,
        language: String = "English / Tamil"
    ): Pair<String, List<Chapter>> = withContext(Dispatchers.IO) {
        val apiKey = try {
            BuildConfig.GEMINI_API_KEY
        } catch (_: Exception) {
            ""
        }

        if (apiKey.isNullOrBlank() || apiKey.startsWith("GEMINI_API_KEY")) {
            return@withContext generateOfflineNovel(title, author, genre, prompt)
        }

        val systemPrompt = """
            You are an expert novelist and creative storyteller. 
            Generate an engaging opening chapter and description for a new novel in the '$genre' genre.
            Title: $title
            Author: $author
            Prompt / Core Concept: $prompt
            Language: $language

            Please return your response formatted as:
            DESCRIPTION: [2-3 sentences book summary]
            ---
            CHAPTER 1: [Chapter Title]
            [Rich narrative content with dialogue and atmosphere, ~400-600 words]
            ---
            CHAPTER 2: [Chapter Title]
            [Second chapter continuing the intrigue, ~400-600 words]
        """.trimIndent()

        val request = GenerateContentRequest(
            contents = listOf(Content(parts = listOf(Part(text = "Please write the novel as specified in the system instructions.")))),
            generationConfig = GenerationConfig(temperature = 0.8f),
            systemInstruction = Content(parts = listOf(Part(text = systemPrompt)))
        )

        try {
            val response = service.generateContent(apiKey, request)
            val fullText = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
            if (fullText.isNullOrBlank()) {
                generateOfflineNovel(title, author, genre, prompt)
            } else {
                parseGeneratedNovel(fullText, title, prompt)
            }
        } catch (e: Exception) {
            generateOfflineNovel(title, author, genre, prompt)
        }
    }

    private fun parseGeneratedNovel(text: String, title: String, prompt: String): Pair<String, List<Chapter>> {
        var description = "An immersive AI-crafted $title tale exploring $prompt."
        val chapters = mutableListOf<Chapter>()

        val descMatch = Regex("(?i)DESCRIPTION:\\s*(.*?)(?=---|CHAPTER 1:|$)", RegexOption.DOT_MATCHES_ALL).find(text)
        if (descMatch != null) {
            description = descMatch.groupValues[1].trim()
        }

        val chapterPattern = Regex("(?i)CHAPTER\\s*(\\d+):?\\s*([^\\n]+)\\n([\\s\\S]*?)(?=(?:CHAPTER\\s*\\d+:?|---|$))")
        val matches = chapterPattern.findAll(text).toList()

        if (matches.isNotEmpty()) {
            matches.forEachIndexed { index, match ->
                val num = match.groupValues[1].toIntOrNull() ?: (index + 1)
                val chTitle = match.groupValues[2].trim()
                val chContent = match.groupValues[3].trim()
                chapters.add(
                    Chapter(
                        id = "ai-ch-${System.currentTimeMillis()}-$num",
                        number = num,
                        title = chTitle.ifBlank { "Chapter $num" },
                        content = chContent
                    )
                )
            }
        } else {
            chapters.add(
                Chapter(
                    id = "ai-ch-${System.currentTimeMillis()}-1",
                    number = 1,
                    title = "The Genesis of Destiny",
                    content = text.substringAfter("---").trim().ifBlank { text }
                )
            )
        }

        return Pair(description, chapters)
    }

    private fun getOfflineCompanionAnswer(bookTitle: String, chapterTitle: String, query: String): String {
        val qLower = query.toLowerCase()
        return when {
            qLower.contains("character") || qLower.contains("who is") || qLower.contains("vanthiyathevan") -> {
                "In '$bookTitle', the characters play nuanced roles between honor and statecraft. In this section ('$chapterTitle'), the protagonist navigates covert alliances with sharp wit and daring bravery. Key figures represent historical loyalty versus factional ambition."
            }
            qLower.contains("summary") || qLower.contains("summarize") || qLower.contains("what happened") -> {
                "Chapter Summary for '$chapterTitle': This chapter establishes the atmospheric setting and political intrigue of $bookTitle. The narrative weaves suspense, uncovering hidden motives and setting into motion events that determine the realm's fate."
            }
            qLower.contains("tamil") || qLower.contains("meaning") || qLower.contains("kalki") -> {
                "Tamil Literary Insight: The prose employs Sangam and classical Tamil nuances (செந்தமிழ்) blending evocative geographical imagery (such as the Aadi perukku flood at Veera Narayana Lake) with dynamic character dialogue."
            }
            else -> {
                "Regarding your inquiry about '$query' in $bookTitle: The narrative explores overarching themes of duty, destiny, and philosophical introspection. Notice how the dialogue in '$chapterTitle' highlights underlying motivations."
            }
        }
    }

    private fun generateOfflineNovel(title: String, author: String, genre: String, prompt: String): Pair<String, List<Chapter>> {
        val description = "An enchanting $genre masterpiece woven by $author. $prompt"
        val chapters = listOf(
            Chapter(
                id = "ai-ch-1",
                number = 1,
                title = "The Threshold of Whispers",
                content = """
The twilight cast deep amber reflections across the ancient courtyard. $author stood at the edge of the forgotten citadel, clutching the encrypted manuscript described in the legends.

"$prompt," whispered the wind through the crumbling granite pillars. 

Every inscription upon the stone resonated with mysterious power. Somewhere in the shadowy corridors, footsteps approached with deliberate slowness. The adventure in $title had commenced.
                """.trimIndent()
            ),
            Chapter(
                id = "ai-ch-2",
                number = 2,
                title = "Echoes of the Starlight",
                content = """
As dawn pierced the horizon, the true significance of the artifact became clear. The factions vying for control had mobilized across the valley.

With a resolved gaze and steadfast courage, the journey towards the inner sanctuary began. Destiny awaited beyond the high mountain pass.
                """.trimIndent()
            )
        )
        return Pair(description, chapters)
    }
}
