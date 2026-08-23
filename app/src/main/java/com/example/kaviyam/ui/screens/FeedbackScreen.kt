package com.example.kaviyam.ui.screens

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.example.kaviyam.ui.theme.GoldLight
import com.example.kaviyam.ui.theme.GoldPrimary
import com.example.kaviyam.ui.theme.NavyBorder
import com.example.kaviyam.ui.theme.NavyCard
import com.example.kaviyam.ui.theme.NavyDarkest
import com.example.kaviyam.ui.theme.NavySurface
import com.example.kaviyam.ui.viewmodel.KaviyamViewModel

data class FaqItem(
    val question: String,
    val answer: String
)

@Composable
fun FeedbackScreen(
    viewModel: KaviyamViewModel
) {
    var feedbackSubject by remember { mutableStateOf("") }
    var feedbackMessage by remember { mutableStateOf("") }
    var rating by remember { mutableIntStateOf(5) }
    var isSubmitted by remember { mutableStateOf(false) }

    val faqs = listOf(
        FaqItem(
            question = "How does the Kaviyam AI Literary Companion work?",
            answer = "The Kaviyam AI Companion uses Google's Gemini generative model to analyze whatever chapter you are reading in real-time. It can answer character questions, explain classical Tamil grammatical forms, unpack Sangam cultural references, and summarize intricate plot developments."
        ),
        FaqItem(
            question = "How do I generate an original multi-chapter story?",
            answer = "Go to the 'AI Studio' tab, select your preferred genre (such as Historical Tamil, Chola Dynasty Saga, or Cyberpunk), write your prompt premise, and tap 'Synthesize Novel'. The novel is generated and automatically added to your bookshelf with chapters and cover art."
        ),
        FaqItem(
            question = "Is audio voice narration available for Tamil classics?",
            answer = "Yes! While in the Reader, tap the speaker icon on the top bar. The built-in Text-to-Speech engine dynamically reads the Tamil or English text aloud."
        ),
        FaqItem(
            question = "Are my bookmarks, reading progress, and stories saved offline?",
            answer = "Yes. All books, chapter progress percentages, bookmarks, reviews, and security logs are safely persisted locally on your device via Room Database."
        )
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDarkest)
            .padding(16.dp)
            .testTag("feedback_screen_root")
    ) {
        item {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(GoldPrimary.copy(alpha = 0.15f), CircleShape)
                        .border(1.dp, GoldPrimary, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.HelpOutline,
                        contentDescription = null,
                        tint = GoldLight,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Help, FAQ & Feedback",
                        color = GoldLight,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                    Text(
                        text = "User assistance & community feedback channel",
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 12.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Feedback Submission Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = NavyCard)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp)
                ) {
                    Text(
                        text = "Send Feedback or Feature Request",
                        color = GoldLight,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    Text(text = "Experience Rating:", color = Color.White, fontSize = 12.sp)
                    Row(modifier = Modifier.padding(vertical = 4.dp)) {
                        (1..5).forEach { star ->
                            IconButton(
                                onClick = { rating = star },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Star,
                                    contentDescription = "$star stars",
                                    tint = if (star <= rating) GoldLight else Color.Gray
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    OutlinedTextField(
                        value = feedbackSubject,
                        onValueChange = { feedbackSubject = it },
                        placeholder = { Text("Subject (e.g., Reader typography suggestion)", color = Color.Gray, fontSize = 12.sp) },
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

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = feedbackMessage,
                        onValueChange = { feedbackMessage = it },
                        placeholder = { Text("Your detailed comments or suggestions...", color = Color.Gray, fontSize = 12.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3,
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

                    Button(
                        onClick = {
                            if (feedbackMessage.isNotBlank()) {
                                isSubmitted = true
                                feedbackMessage = ""
                                feedbackSubject = ""
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp)
                            .testTag("submit_feedback_btn"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = GoldPrimary,
                            contentColor = NavyDarkest
                        )
                    ) {
                        Icon(imageVector = Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Transmit Feedback", fontWeight = FontWeight.Bold)
                    }

                    if (isSubmitted) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "Thank you! Your feedback has been received and logged.",
                            color = GoldLight,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Frequently Asked Questions",
                color = Color.White,
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
                fontSize = 17.sp
            )

            Spacer(modifier = Modifier.height(10.dp))
        }

        // FAQs list
        items(faqs) { faq ->
            FaqAccordionItem(faq = faq)
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Platform info footer
        item {
            Spacer(modifier = Modifier.height(18.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurface)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.Info, contentDescription = null, tint = GoldLight, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Kaviyam Reading • Version 1.0 (Android Native)",
                            color = GoldLight,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Engineered with Jetpack Compose, Room SQLite, Material 3, and Google Gemini AI.",
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 11.sp
                    )
                }
            }
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

@Composable
private fun FaqAccordionItem(faq: FaqItem) {
    var isExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(NavySurface)
            .border(1.dp, NavyBorder, RoundedCornerShape(12.dp))
            .clickable { isExpanded = !isExpanded }
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = faq.question,
                color = Color.White,
                fontWeight = FontWeight.SemiBold,
                fontSize = 13.sp,
                modifier = Modifier.weight(1f)
            )
            Icon(
                imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                contentDescription = null,
                tint = GoldLight
            )
        }

        AnimatedVisibility(visible = isExpanded) {
            Column {
                Spacer(modifier = Modifier.height(10.dp))
                HorizontalDivider(color = NavyBorder)
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = faq.answer,
                    color = Color(0xFFCBD5E1),
                    fontSize = 12.sp,
                    lineHeight = 18.sp
                )
            }
        }
    }
}
