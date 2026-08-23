package com.example.kaviyam.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.FormatSize
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.kaviyam.data.models.Book
import com.example.kaviyam.ui.components.AiCompanionDialog
import com.example.kaviyam.ui.components.ReaderSettingsSheet
import com.example.kaviyam.ui.theme.GoldLight
import com.example.kaviyam.ui.theme.GoldPrimary
import com.example.kaviyam.ui.theme.NavyBorder
import com.example.kaviyam.ui.theme.NavyDark
import com.example.kaviyam.ui.theme.NavyDarkest
import com.example.kaviyam.ui.theme.NavySurface
import com.example.kaviyam.ui.theme.ParchmentBg
import com.example.kaviyam.ui.theme.ParchmentText
import com.example.kaviyam.ui.theme.SepiaBg
import com.example.kaviyam.ui.theme.SepiaText
import com.example.kaviyam.ui.viewmodel.KaviyamViewModel
import com.example.kaviyam.ui.viewmodel.ReaderFontFamily
import com.example.kaviyam.ui.viewmodel.ReaderTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderScreen(
    book: Book,
    viewModel: KaviyamViewModel,
    onBack: () -> Unit
) {
    val activeChapterIndex by viewModel.activeChapterIndex.collectAsStateWithLifecycle()
    val readerSettings by viewModel.readerSettings.collectAsStateWithLifecycle()
    val isTtsPlaying by viewModel.tts.isPlaying.collectAsStateWithLifecycle()
    val companionMessages by viewModel.companionMessages.collectAsStateWithLifecycle()
    val isCompanionThinking by viewModel.isCompanionThinking.collectAsStateWithLifecycle()

    val chapters = viewModel.getChapters(book)
    val currentChapter = chapters.getOrNull(activeChapterIndex) ?: return

    var showSettingsSheet by remember { mutableStateOf(false) }
    var showCompanionSheet by remember { mutableStateOf(false) }

    val scrollState = rememberScrollState()

    // Determine colors based on reader theme
    val (canvasBg, textColor, headerColor) = when (readerSettings.theme) {
        ReaderTheme.MIDNIGHT -> Triple(NavyDarkest, Color(0xFFE2E8F0), GoldLight)
        ReaderTheme.PARCHMENT -> Triple(ParchmentBg, ParchmentText, Color(0xFF8C5800))
        ReaderTheme.SEPIA -> Triple(SepiaBg, SepiaText, Color(0xFF6B420C))
    }

    val selectedFontFamily = when (readerSettings.fontFamily) {
        ReaderFontFamily.SERIF -> FontFamily.Serif
        ReaderFontFamily.SANS_SERIF -> FontFamily.Default
        ReaderFontFamily.MONOSPACE -> FontFamily.Monospace
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = book.title,
                            color = headerColor,
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            maxLines = 1
                        )
                        Text(
                            text = "Chapter ${currentChapter.number} of ${chapters.size}",
                            color = textColor.copy(alpha = 0.7f),
                            fontSize = 11.sp
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack, modifier = Modifier.testTag("reader_back_btn")) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = headerColor
                        )
                    }
                },
                actions = {
                    // TTS Narration Button
                    IconButton(
                        onClick = { viewModel.readCurrentChapterAloud() },
                        modifier = Modifier.testTag("tts_narration_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.VolumeUp,
                            contentDescription = "Read Aloud",
                            tint = if (isTtsPlaying) GoldLight else textColor.copy(alpha = 0.7f)
                        )
                    }

                    // Reader Settings Button
                    IconButton(
                        onClick = { showSettingsSheet = true },
                        modifier = Modifier.testTag("reader_settings_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.FormatSize,
                            contentDescription = "Typography",
                            tint = headerColor
                        )
                    }

                    // AI Literary Companion Button
                    IconButton(
                        onClick = { showCompanionSheet = true },
                        modifier = Modifier
                            .padding(end = 4.dp)
                            .background(GoldPrimary.copy(alpha = 0.2f), CircleShape)
                            .testTag("reader_ai_companion_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = "AI Companion",
                            tint = GoldLight
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = canvasBg
                )
            )
        },
        bottomBar = {
            // Chapter Navigation Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(canvasBg)
                    .border(width = 1.dp, color = NavyBorder.copy(alpha = 0.3f))
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { viewModel.previousChapter() },
                    enabled = activeChapterIndex > 0,
                    modifier = Modifier.testTag("prev_chapter_btn")
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Previous Chapter",
                        tint = if (activeChapterIndex > 0) headerColor else Color.Gray.copy(alpha = 0.4f)
                    )
                }

                Text(
                    text = "Ch ${activeChapterIndex + 1} / ${chapters.size}",
                    color = textColor.copy(alpha = 0.8f),
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )

                IconButton(
                    onClick = { viewModel.nextChapter() },
                    enabled = activeChapterIndex < chapters.size - 1,
                    modifier = Modifier.testTag("next_chapter_btn")
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Next Chapter",
                        tint = if (activeChapterIndex < chapters.size - 1) headerColor else Color.Gray.copy(alpha = 0.4f)
                    )
                }
            }
        },
        containerColor = canvasBg
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(canvasBg)
                .testTag("reader_content_canvas")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(scrollState)
                    .padding(horizontal = 22.dp, vertical = 16.dp)
            ) {
                // Chapter Header
                Text(
                    text = "CHAPTER ${currentChapter.number}",
                    color = headerColor,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = currentChapter.title,
                    color = textColor,
                    fontSize = (readerSettings.fontSizeSp + 4).sp,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold
                )

                if (!currentChapter.tamilTitle.isNullOrBlank()) {
                    Text(
                        text = currentChapter.tamilTitle,
                        color = headerColor,
                        fontSize = (readerSettings.fontSizeSp + 1).sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))
                HorizontalDivider(color = NavyBorder.copy(alpha = 0.3f))
                Spacer(modifier = Modifier.height(20.dp))

                // Chapter Reading Text
                Text(
                    text = currentChapter.content,
                    color = textColor,
                    fontSize = readerSettings.fontSizeSp.sp,
                    fontFamily = selectedFontFamily,
                    lineHeight = (readerSettings.fontSizeSp * readerSettings.lineHeightMultiplier).sp,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(60.dp))
            }
        }

        // Settings Sheet
        if (showSettingsSheet) {
            ReaderSettingsSheet(
                settings = readerSettings,
                onDismiss = { showSettingsSheet = false },
                onThemeChange = { viewModel.updateReaderTheme(it) },
                onFontSizeDelta = { viewModel.updateFontSize(it) },
                onFontFamilyChange = { viewModel.updateFontFamily(it) },
                onLineHeightChange = { viewModel.updateLineHeight(it) }
            )
        }

        // AI Companion Dialog
        if (showCompanionSheet) {
            AiCompanionDialog(
                bookTitle = book.title,
                chapterTitle = currentChapter.title,
                messages = companionMessages,
                isThinking = isCompanionThinking,
                onDismiss = { showCompanionSheet = false },
                onSendMessage = { viewModel.askCompanion(it) }
            )
        }
    }
}
