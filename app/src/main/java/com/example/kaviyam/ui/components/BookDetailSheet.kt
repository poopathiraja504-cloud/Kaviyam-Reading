package com.example.kaviyam.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
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
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import coil.compose.AsyncImage
import com.example.kaviyam.data.models.Book
import com.example.kaviyam.data.models.Chapter
import com.example.kaviyam.data.models.Review
import com.example.kaviyam.ui.theme.GoldLight
import com.example.kaviyam.ui.theme.GoldPrimary
import com.example.kaviyam.ui.theme.NavyBorder
import com.example.kaviyam.ui.theme.NavyCard
import com.example.kaviyam.ui.theme.NavyDark
import com.example.kaviyam.ui.theme.NavyDarkest
import com.example.kaviyam.ui.theme.NavySurface

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookDetailSheet(
    book: Book,
    chapters: List<Chapter>,
    reviews: List<Review>,
    tags: List<String>,
    onDismiss: () -> Unit,
    onReadChapter: (Int) -> Unit,
    onBookmarkToggle: () -> Unit,
    onSubmitReview: (Int, String, String) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var reviewRating by remember { mutableIntStateOf(5) }
    var reviewComment by remember { mutableStateOf("") }
    var reviewerName by remember { mutableStateOf("") }
    var showReviewInput by remember { mutableStateOf(false) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = NavyDark,
        dragHandle = null,
        modifier = Modifier.testTag("book_detail_sheet")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.9f)
        ) {
            // Header Image & Close
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
            ) {
                AsyncImage(
                    model = book.coverImage,
                    contentDescription = book.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxWidth()
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Black.copy(alpha = 0.3f),
                                    NavyDark
                                )
                            )
                        )
                )

                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(12.dp)
                        .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                        .testTag("close_detail_btn")
                ) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                }

                Row(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = onBookmarkToggle,
                        modifier = Modifier
                            .background(NavySurface, RoundedCornerShape(12.dp))
                            .border(1.dp, NavyBorder, RoundedCornerShape(12.dp))
                    ) {
                        Icon(
                            imageVector = if (book.isBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                            contentDescription = "Bookmark",
                            tint = if (book.isBookmarked) GoldLight else Color.White
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Button(
                        onClick = { onReadChapter(book.lastReadChapterIndex) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("start_reading_btn"),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = GoldPrimary,
                            contentColor = NavyDarkest
                        )
                    ) {
                        Icon(imageVector = Icons.Default.MenuBook, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (book.progressPercentage > 0) "Continue Reading (Ch ${book.lastReadChapterIndex + 1})" else "Start Reading",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }
                }
            }

            // Scrollable Content
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                item {
                    Text(
                        text = book.title,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 22.sp,
                        color = Color.White
                    )

                    if (!book.tamilTitle.isNullOrBlank()) {
                        Text(
                            text = book.tamilTitle,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = GoldLight
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "By ${book.author} • ${book.year} • ${book.language}",
                        fontSize = 13.sp,
                        color = Color.White.copy(alpha = 0.7f)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Tags
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        tags.take(4).forEach { tag ->
                            Box(
                                modifier = Modifier
                                    .background(NavySurface, RoundedCornerShape(8.dp))
                                    .border(1.dp, NavyBorder, RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = tag,
                                    fontSize = 11.sp,
                                    color = GoldLight,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Synopsis",
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = GoldLight
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = book.description,
                        fontSize = 13.sp,
                        color = Color(0xFFCBD5E1),
                        lineHeight = 20.sp
                    )

                    Spacer(modifier = Modifier.height(20.dp))
                    HorizontalDivider(color = NavyBorder)
                    Spacer(modifier = Modifier.height(16.dp))

                    // Chapters Section Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Chapters (${chapters.size})",
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = GoldLight
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                }

                // Chapters list
                items(chapters.withIndex().toList()) { (index, chapter) ->
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(NavySurface)
                            .clickable { onReadChapter(index) }
                            .padding(12.dp)
                            .testTag("chapter_item_$index")
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .background(GoldPrimary.copy(alpha = 0.15f), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "${chapter.number}",
                                        color = GoldLight,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp
                                    )
                                }

                                Spacer(modifier = Modifier.width(12.dp))

                                Column {
                                    Text(
                                        text = chapter.title,
                                        color = Color.White,
                                        fontWeight = FontWeight.SemiBold,
                                        fontSize = 13.sp
                                    )
                                    if (!chapter.tamilTitle.isNullOrBlank()) {
                                        Text(
                                            text = chapter.tamilTitle,
                                            color = GoldLight.copy(alpha = 0.8f),
                                            fontSize = 11.sp
                                        )
                                    }
                                }
                            }

                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = "Read",
                                tint = GoldLight,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(20.dp))
                    HorizontalDivider(color = NavyBorder)
                    Spacer(modifier = Modifier.height(16.dp))

                    // Reviews Header & Write Review Toggle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Reader Reviews (${reviews.size})",
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = GoldLight
                        )

                        Button(
                            onClick = { showReviewInput = !showReviewInput },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = NavySurface,
                                contentColor = GoldLight
                            ),
                            modifier = Modifier.testTag("toggle_review_btn")
                        ) {
                            Text(text = if (showReviewInput) "Cancel" else "+ Add Review", fontSize = 11.sp)
                        }
                    }

                    if (showReviewInput) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(NavySurface, RoundedCornerShape(12.dp))
                                .border(1.dp, NavyBorder, RoundedCornerShape(12.dp))
                                .padding(12.dp)
                        ) {
                            Text(text = "Rating:", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Row(modifier = Modifier.padding(vertical = 4.dp)) {
                                (1..5).forEach { star ->
                                    IconButton(
                                        onClick = { reviewRating = star },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Star,
                                            contentDescription = "$star stars",
                                            tint = if (star <= reviewRating) GoldLight else Color.Gray
                                        )
                                    }
                                }
                            }

                            OutlinedTextField(
                                value = reviewerName,
                                onValueChange = { reviewerName = it },
                                label = { Text("Your Pen Name", color = Color.Gray, fontSize = 12.sp) },
                                modifier = Modifier.fillMaxWidth(),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    focusedBorderColor = GoldPrimary,
                                    unfocusedBorderColor = NavyBorder
                                )
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            OutlinedTextField(
                                value = reviewComment,
                                onValueChange = { reviewComment = it },
                                label = { Text("Write your review...", color = Color.Gray, fontSize = 12.sp) },
                                modifier = Modifier.fillMaxWidth(),
                                minLines = 2,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    focusedBorderColor = GoldPrimary,
                                    unfocusedBorderColor = NavyBorder
                                )
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            Button(
                                onClick = {
                                    if (reviewComment.isNotBlank()) {
                                        onSubmitReview(reviewRating, reviewComment, reviewerName)
                                        reviewComment = ""
                                        showReviewInput = false
                                    }
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("submit_review_btn"),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = GoldPrimary,
                                    contentColor = NavyDarkest
                                )
                            ) {
                                Text("Publish Review", fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Reviews List
                items(reviews) { review ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp)
                            .background(NavySurface, RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = review.username,
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                            Row {
                                (1..5).forEach { star ->
                                    Icon(
                                        imageVector = Icons.Default.Star,
                                        contentDescription = null,
                                        tint = if (star <= review.rating) GoldLight else Color.Gray.copy(alpha = 0.4f),
                                        modifier = Modifier.size(12.dp)
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = review.comment,
                            color = Color(0xFFCBD5E1),
                            fontSize = 12.sp,
                            lineHeight = 18.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = review.date,
                            color = Color.White.copy(alpha = 0.4f),
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(40.dp))
                }
            }
        }
    }
}
