package com.example.kaviyam.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.example.kaviyam.ui.components.BookCard
import com.example.kaviyam.ui.components.BookDetailSheet
import com.example.kaviyam.ui.theme.GoldLight
import com.example.kaviyam.ui.theme.GoldPrimary
import com.example.kaviyam.ui.theme.NavyBorder
import com.example.kaviyam.ui.theme.NavyCard
import com.example.kaviyam.ui.theme.NavyDark
import com.example.kaviyam.ui.theme.NavyDarkest
import com.example.kaviyam.ui.theme.NavySurface
import com.example.kaviyam.ui.viewmodel.KaviyamViewModel

@Composable
fun LibraryScreen(
    viewModel: KaviyamViewModel,
    onOpenReader: (Book, Int) -> Unit
) {
    val filteredBooks by viewModel.filteredBooks.collectAsStateWithLifecycle()
    val allBooks by viewModel.allBooks.collectAsStateWithLifecycle()
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val selectedGenre by viewModel.selectedGenre.collectAsStateWithLifecycle()

    var selectedBookForDetail by remember { mutableStateOf<Book?>(null) }

    val genres = listOf("All", "Tamil Classics", "Bookmarks", "Fantasy", "Sci-Fi", "AI Generated")
    val featuredBook = allBooks.firstOrNull { it.id == "book-ponniyin-selvan" } ?: allBooks.firstOrNull()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDarkest)
            .testTag("library_screen_root")
    ) {
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            // Header Title
            item(span = { GridItemSpan(2) }) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Kaviyam Bookshelf",
                                color = GoldLight,
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Bold,
                                fontSize = 24.sp
                            )
                            Text(
                                text = "Explore classical Tamil treasures & modern epics",
                                color = Color.White.copy(alpha = 0.7f),
                                fontSize = 12.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Search Bar
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { viewModel.setSearchQuery(it) },
                        placeholder = { Text("Search by title, author, or keyword...", color = Color.Gray, fontSize = 13.sp) },
                        leadingIcon = {
                            Icon(imageVector = Icons.Default.Search, contentDescription = "Search", tint = GoldLight)
                        },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { viewModel.setSearchQuery("") }) {
                                    Icon(imageVector = Icons.Default.Close, contentDescription = "Clear", tint = Color.White)
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("library_search_input"),
                        shape = RoundedCornerShape(16.dp),
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

                    // Genre Filter Chips
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(genres) { genre ->
                            val isSelected = selectedGenre == genre
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (isSelected) GoldPrimary else NavySurface)
                                    .border(1.dp, if (isSelected) GoldLight else NavyBorder, RoundedCornerShape(12.dp))
                                    .clickable { viewModel.setSelectedGenre(genre) }
                                    .padding(horizontal = 14.dp, vertical = 8.dp)
                                    .testTag("genre_chip_$genre"),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = genre,
                                    color = if (isSelected) Color.Black else Color.White,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    // Featured Hero Banner (if not searching and on "All")
                    if (searchQuery.isBlank() && selectedGenre == "All" && featuredBook != null) {
                        Spacer(modifier = Modifier.height(16.dp))
                        FeaturedHeroCard(
                            book = featuredBook,
                            onClick = { selectedBookForDetail = featuredBook },
                            onReadClick = { onOpenReader(featuredBook, featuredBook.lastReadChapterIndex) }
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Featured & Popular Books",
                            color = Color.White,
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp
                        )
                    }
                }
            }

            // Books Grid
            if (filteredBooks.isEmpty()) {
                item(span = { GridItemSpan(2) }) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No books found matching your criteria.",
                            color = Color.White.copy(alpha = 0.6f),
                            fontSize = 13.sp
                        )
                    }
                }
            } else {
                items(filteredBooks, key = { it.id }) { book ->
                    BookCard(
                        book = book,
                        onClick = { selectedBookForDetail = book },
                        onBookmarkToggle = { viewModel.toggleBookmark(book) }
                    )
                }
            }

            item(span = { GridItemSpan(2) }) {
                Spacer(modifier = Modifier.height(40.dp))
            }
        }

        // Book Detail Modal Sheet
        selectedBookForDetail?.let { book ->
            BookDetailSheet(
                book = book,
                chapters = viewModel.getChapters(book),
                reviews = viewModel.getReviews(book),
                tags = viewModel.getTags(book),
                onDismiss = { selectedBookForDetail = null },
                onReadChapter = { chapterIndex ->
                    selectedBookForDetail = null
                    onOpenReader(book, chapterIndex)
                },
                onBookmarkToggle = { viewModel.toggleBookmark(book) },
                onSubmitReview = { rating, comment, username ->
                    viewModel.addReview(book.id, rating, comment, username)
                }
            )
        }
    }
}

@Composable
private fun FeaturedHeroCard(
    book: Book,
    onClick: () -> Unit,
    onReadClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(190.dp)
            .clickable(onClick = onClick)
            .testTag("featured_hero_card"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = NavyCard)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
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
                        Brush.horizontalGradient(
                            colors = listOf(
                                NavyDarkest.copy(alpha = 0.95f),
                                NavyDarkest.copy(alpha = 0.6f),
                                Color.Transparent
                            )
                        )
                    )
            )

            Column(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(0.7f)
                    .padding(16.dp),
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .background(GoldPrimary.copy(alpha = 0.2f), RoundedCornerShape(6.dp))
                        .border(1.dp, GoldPrimary, RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "⭐ LITERARY SPOTLIGHT",
                        color = GoldLight,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = book.title,
                    color = Color.White,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    maxLines = 1
                )

                if (!book.tamilTitle.isNullOrBlank()) {
                    Text(
                        text = book.tamilTitle,
                        color = GoldLight,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Text(
                    text = "By ${book.author}",
                    color = Color.White.copy(alpha = 0.7f),
                    fontSize = 11.sp
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(GoldPrimary)
                        .clickable(onClick = onReadClick)
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.MenuBook,
                        contentDescription = null,
                        tint = NavyDarkest,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Read Classic",
                        color = NavyDarkest,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
