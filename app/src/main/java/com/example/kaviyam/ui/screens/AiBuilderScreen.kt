package com.example.kaviyam.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Brush
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Sparkles
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.kaviyam.data.models.Book
import com.example.kaviyam.ui.theme.GoldLight
import com.example.kaviyam.ui.theme.GoldPrimary
import com.example.kaviyam.ui.theme.NavyBorder
import com.example.kaviyam.ui.theme.NavyCard
import com.example.kaviyam.ui.theme.NavyDarkest
import com.example.kaviyam.ui.theme.NavySurface
import com.example.kaviyam.ui.viewmodel.KaviyamViewModel

@Composable
fun AiBuilderScreen(
    viewModel: KaviyamViewModel,
    onNovelCreated: (Book) -> Unit
) {
    val isGenerating by viewModel.isGeneratingNovel.collectAsStateWithLifecycle()
    val generationStatus by viewModel.novelGenerationStatus.collectAsStateWithLifecycle()

    var novelTitle by remember { mutableStateOf("") }
    var authorName by remember { mutableStateOf("Boopathi Raja") }
    var selectedGenre by remember { mutableStateOf("Historical Tamil") }
    var storyPrompt by remember { mutableStateOf("") }

    val presetGenres = listOf(
        "Historical Tamil",
        "Chola Dynasty Saga",
        "Cyberpunk Neo-Madurai",
        "High Fantasy & Runes",
        "Cosmic Sci-Fi",
        "Mystery & Suspense"
    )

    val samplePrompts = listOf(
        "A covert naval commander under Rajendra Chola embarks on a secret expedition across the Bay of Bengal to Kadaram.",
        "In 2140 Neo-Thanjavur, an archaeologist awakens an ancient artificial intelligence residing in the Brihadisvara vimana.",
        "A wandering Tamil martial artist discovers a mystic palm-leaf scroll containing forgotten Varma Kalai secrets."
    )

    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDarkest)
            .verticalScroll(scrollState)
            .padding(18.dp)
            .testTag("ai_builder_root")
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(Color(0xFF6B21A8).copy(alpha = 0.3f), CircleShape)
                    .border(1.dp, Color(0xFFC084FC), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = Color(0xFFE9D5FF),
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = "Kaviyam AI Novel Studio",
                    color = GoldLight,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp
                )
                Text(
                    text = "Synthesize multi-chapter original epics powered by Gemini",
                    color = Color.White.copy(alpha = 0.7f),
                    fontSize = 12.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Novel Builder Form Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = NavyCard)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp)
            ) {
                // Title Field
                Text(
                    text = "Novel Title",
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = novelTitle,
                    onValueChange = { novelTitle = it },
                    placeholder = { Text("e.g. Shadows of the Chola Crown", color = Color.Gray, fontSize = 13.sp) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("ai_novel_title_input"),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = GoldPrimary,
                        unfocusedBorderColor = NavyBorder,
                        focusedContainerColor = NavySurface,
                        unfocusedContainerColor = NavySurface
                    )
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Pen Name
                Text(
                    text = "Author Pen Name",
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = authorName,
                    onValueChange = { authorName = it },
                    placeholder = { Text("Your author name", color = Color.Gray, fontSize = 13.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = GoldPrimary,
                        unfocusedBorderColor = NavyBorder,
                        focusedContainerColor = NavySurface,
                        unfocusedContainerColor = NavySurface
                    )
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Genre Chips
                Text(
                    text = "Genre & World Setting",
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(8.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(presetGenres) { genre ->
                        val isSelected = selectedGenre == genre
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) GoldPrimary else NavySurface)
                                .border(1.dp, if (isSelected) GoldLight else NavyBorder, RoundedCornerShape(10.dp))
                                .clickable { selectedGenre = genre }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = genre,
                                color = if (isSelected) Color.Black else Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Prompt Area
                Text(
                    text = "Story Premise & Core Plot Threads",
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = storyPrompt,
                    onValueChange = { storyPrompt = it },
                    placeholder = { Text("Describe the conflict, characters, setting, and dramatic stakes...", color = Color.Gray, fontSize = 13.sp) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp)
                        .testTag("ai_story_prompt_input"),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = GoldPrimary,
                        unfocusedBorderColor = NavyBorder,
                        focusedContainerColor = NavySurface,
                        unfocusedContainerColor = NavySurface
                    )
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Quick Prompt Inspiration
                Text(
                    text = "💡 Quick Ideas (Tap to fill):",
                    color = GoldLight,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(6.dp))
                samplePrompts.forEach { promptText ->
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 3.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(NavySurface)
                            .clickable {
                                storyPrompt = promptText
                                if (novelTitle.isBlank()) {
                                    novelTitle = when {
                                        promptText.contains("Rajendra") -> "The Kadaram Fleet"
                                        promptText.contains("2140") -> "Echoes of Brihadisvara"
                                        else -> "The Varma Chronicles"
                                    }
                                }
                            }
                            .padding(8.dp)
                    ) {
                        Text(
                            text = "• $promptText",
                            color = Color.White.copy(alpha = 0.8f),
                            fontSize = 11.sp,
                            lineHeight = 16.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Submit Button
                Button(
                    onClick = {
                        viewModel.generateAiNovel(
                            title = novelTitle.ifBlank { "The Lost Empire" },
                            author = authorName,
                            genre = selectedGenre,
                            prompt = storyPrompt.ifBlank { "An epic quest for historical wisdom and truth." },
                            coverImage = "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600",
                            onComplete = { book ->
                                onNovelCreated(book)
                            }
                        )
                    },
                    enabled = !isGenerating,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                        .testTag("synthesize_novel_btn"),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = GoldPrimary,
                        contentColor = NavyDarkest
                    )
                ) {
                    if (isGenerating) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = NavyDarkest,
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text("Synthesizing Chapters with Gemini...", fontWeight = FontWeight.Bold)
                    } else {
                        Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Synthesize Novel with Gemini", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }

                if (generationStatus.isNotBlank()) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = generationStatus,
                        color = GoldLight,
                        fontSize = 12.sp,
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))
    }
}
