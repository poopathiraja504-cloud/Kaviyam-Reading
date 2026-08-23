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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FormatQuote
import androidx.compose.material.icons.filled.HistoryEdu
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.example.kaviyam.data.models.Book
import com.example.kaviyam.data.models.TamilAuthor
import com.example.kaviyam.ui.theme.GoldDark
import com.example.kaviyam.ui.theme.GoldLight
import com.example.kaviyam.ui.theme.GoldPrimary
import com.example.kaviyam.ui.theme.NavyBorder
import com.example.kaviyam.ui.theme.NavyCard
import com.example.kaviyam.ui.theme.NavyDarkest
import com.example.kaviyam.ui.theme.NavySurface
import com.example.kaviyam.ui.viewmodel.KaviyamViewModel

@Composable
fun TamilDashboardScreen(
    viewModel: KaviyamViewModel,
    onOpenBook: (Book) -> Unit
) {
    val allBooks by viewModel.allBooks.collectAsStateWithLifecycle()
    val tamilClassics = allBooks.filter { it.isTamilClassic || it.genre == "Tamil Classics" || it.genre == "Philosophy" }
    val quotes = viewModel.tamilQuotes
    val authors = viewModel.tamilAuthors

    var selectedAuthor by remember { mutableStateOf<TamilAuthor?>(null) }
    var activeQuoteIndex by remember { mutableStateOf(0) }
    val activeQuote = quotes.getOrElse(activeQuoteIndex) { quotes.first() }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDarkest)
            .padding(16.dp)
            .testTag("tamil_dashboard_root")
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
                        imageVector = Icons.Default.HistoryEdu,
                        contentDescription = null,
                        tint = GoldLight,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "தமிழ் இலக்கியக் கூடம்",
                        color = GoldLight,
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                    Text(
                        text = "Tamil Classical Heritage & Wisdom Archive",
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 12.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Thirukkural of the Day Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("thirukkural_card"),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = NavyCard)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.FormatQuote,
                                contentDescription = null,
                                tint = GoldLight,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "THIRUKKURAL • குறள் ${activeQuote.kuralNumber}",
                                color = GoldLight,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        IconButton(
                            onClick = {
                                viewModel.tts.speak(
                                    "${activeQuote.tamil}. Explanation: ${activeQuote.english}",
                                    isTamil = true
                                )
                            },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.VolumeUp,
                                contentDescription = "Listen",
                                tint = GoldLight
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = activeQuote.tamil,
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        lineHeight = 26.sp
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = activeQuote.transliteration,
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 12.sp,
                        fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                    )

                    Spacer(modifier = Modifier.height(10.dp))
                    HorizontalDivider(color = NavyBorder)
                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Meaning: ${activeQuote.english}",
                        color = Color(0xFFCBD5E1),
                        fontSize = 13.sp,
                        lineHeight = 20.sp
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(
                            onClick = {
                                activeQuoteIndex = (activeQuoteIndex + 1) % quotes.size
                            }
                        ) {
                            Text(
                                text = "Next Kural →",
                                color = GoldLight,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Tamil Classics Carousel Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Classic Masterpieces",
                    color = Color.White,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )
                Text(
                    text = "${tamilClassics.size} Volumes",
                    color = GoldLight,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Classics Horizontal List
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(tamilClassics) { classic ->
                    TamilClassicCard(
                        book = classic,
                        onClick = { onOpenBook(classic) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Renowned Authors Section
            Text(
                text = "Literary Titans & Visionary Authors",
                color = Color.White,
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )

            Spacer(modifier = Modifier.height(12.dp))
        }

        // Author items
        items(authors) { author ->
            AuthorListItem(
                author = author,
                onClick = { selectedAuthor = author }
            )
            Spacer(modifier = Modifier.height(10.dp))
        }

        item {
            Spacer(modifier = Modifier.height(18.dp))
            // Tamil Literary Eras Historical Box
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Chronology of Tamil Literature",
                        color = GoldLight,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    EraTimelineRow("Sangam Era (300 BCE – 300 CE)", "Ettuthogai, Pattupattu, Tolkappiyam")
                    EraTimelineRow("Post-Sangam & Epic Age (300 – 600 CE)", "Thirukkural, Silappadikaram, Manimekalai")
                    EraTimelineRow("Imperial Chola & Medieval (900 – 1200 CE)", "Kamba Ramayanam, Periya Puranam, Kalingathu Parani")
                    EraTimelineRow("Modern Renaissance (1900 – Present)", "Kalki, Bharati, Bharathidasan, Sujatha, Pudhumaipithan")
                }
            }
            Spacer(modifier = Modifier.height(40.dp))
        }
    }

    // Author Biography Dialog
    selectedAuthor?.let { author ->
        AlertDialog(
            onDismissRequest = { selectedAuthor = null },
            confirmButton = {
                Button(
                    onClick = { selectedAuthor = null },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = GoldPrimary,
                        contentColor = NavyDarkest
                    )
                ) {
                    Text("Close", fontWeight = FontWeight.Bold)
                }
            },
            title = {
                Column {
                    Text(
                        text = author.name,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        color = GoldLight
                    )
                    Text(
                        text = author.tamilName,
                        fontSize = 14.sp,
                        color = Color.White
                    )
                }
            },
            text = {
                Column {
                    Text(
                        text = author.era,
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = author.bio,
                        color = Color(0xFFCBD5E1),
                        fontSize = 13.sp,
                        lineHeight = 20.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Notable Works: ${author.notableWorks.joinToString(", ")}",
                        color = GoldLight,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp
                    )
                }
            },
            containerColor = NavyDark,
            shape = RoundedCornerShape(20.dp)
        )
    }
}

@Composable
private fun TamilClassicCard(
    book: Book,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .width(160.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = NavyCard)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
            ) {
                AsyncImage(
                    model = book.coverImage,
                    contentDescription = book.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, NavyDarkest.copy(alpha = 0.8f))
                            )
                        )
                )
            }
            Column(modifier = Modifier.padding(10.dp)) {
                Text(
                    text = book.title,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    maxLines = 1
                )
                if (!book.tamilTitle.isNullOrBlank()) {
                    Text(
                        text = book.tamilTitle,
                        color = GoldLight,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1
                    )
                }
                Text(
                    text = book.author,
                    color = Color.White.copy(alpha = 0.6f),
                    fontSize = 10.sp,
                    maxLines = 1
                )
            }
        }
    }
}

@Composable
private fun AuthorListItem(
    author: TamilAuthor,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(NavySurface)
            .border(1.dp, NavyBorder, RoundedCornerShape(14.dp))
            .clickable(onClick = onClick)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .background(GoldPrimary.copy(alpha = 0.2f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = author.name.first().toString(),
                color = GoldLight,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = author.name,
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
            Text(
                text = author.tamilName,
                color = GoldLight,
                fontSize = 12.sp
            )
            Text(
                text = author.era,
                color = Color.White.copy(alpha = 0.5f),
                fontSize = 10.sp
            )
        }

        Icon(
            imageVector = Icons.Default.MenuBook,
            contentDescription = "Read Works",
            tint = GoldLight,
            modifier = Modifier.size(18.dp)
        )
    }
}

@Composable
private fun EraTimelineRow(era: String, works: String) {
    Column(modifier = Modifier.padding(vertical = 4.dp)) {
        Text(text = "• $era", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
        Text(text = "  $works", color = Color.White.copy(alpha = 0.6f), fontSize = 11.sp)
    }
}
