package com.example.kaviyam.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.HistoryEdu
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.kaviyam.data.models.Book
import com.example.kaviyam.ui.screens.AdminScreen
import com.example.kaviyam.ui.screens.AiBuilderScreen
import com.example.kaviyam.ui.screens.EmailInboxScreen
import com.example.kaviyam.ui.screens.FeedbackScreen
import com.example.kaviyam.ui.screens.LibraryScreen
import com.example.kaviyam.ui.screens.ProfileScreen
import com.example.kaviyam.ui.screens.ReaderScreen
import com.example.kaviyam.ui.screens.TamilDashboardScreen
import com.example.kaviyam.ui.theme.GoldLight
import com.example.kaviyam.ui.theme.GoldPrimary
import com.example.kaviyam.ui.theme.NavyBorder
import com.example.kaviyam.ui.theme.NavyCard
import com.example.kaviyam.ui.theme.NavyDark
import com.example.kaviyam.ui.theme.NavyDarkest
import com.example.kaviyam.ui.theme.NavySurface
import com.example.kaviyam.ui.viewmodel.KaviyamViewModel
import kotlinx.coroutines.launch

enum class AppDestination(val label: String, val icon: ImageVector) {
    BOOKSHELF("Bookshelf", Icons.Default.MenuBook),
    TAMIL("Tamil", Icons.Default.HistoryEdu),
    AI_STUDIO("AI Studio", Icons.Default.AutoAwesome),
    INBOX("Mailbox", Icons.Default.Mail),
    PROFILE("Profile", Icons.Default.Person),
    ADMIN("Admin Center", Icons.Default.AdminPanelSettings),
    FEEDBACK("Help & FAQ", Icons.Default.HelpOutline)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KaviyamApp(
    viewModel: KaviyamViewModel
) {
    val activeBook by viewModel.activeBook.collectAsStateWithLifecycle()
    val emails by viewModel.emails.collectAsStateWithLifecycle()
    val unreadEmailCount = emails.count { !it.read }
    val userMessage by viewModel.userMessage.collectAsStateWithLifecycle()

    var currentDestination by remember { mutableStateOf(AppDestination.BOOKSHELF) }
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(userMessage) {
        userMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearUserMessage()
        }
    }

    // If a reader is open, show the dedicated ReaderScreen
    if (activeBook != null) {
        ReaderScreen(
            book = activeBook!!,
            viewModel = viewModel,
            onBack = {
                viewModel.closeReader()
            }
        )
        return
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet(
                drawerContainerColor = NavyDark,
                drawerContentColor = Color.White,
                modifier = Modifier.width(300.dp)
            ) {
                Spacer(modifier = Modifier.height(16.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .background(GoldPrimary.copy(alpha = 0.2f), CircleShape)
                            .border(1.dp, GoldPrimary, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.MenuBook,
                            contentDescription = null,
                            tint = GoldLight,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Kaviyam Reading",
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = GoldLight
                        )
                        Text(
                            text = "இலக்கியக் களஞ்சியம்",
                            fontSize = 11.sp,
                            color = Color.White.copy(alpha = 0.6f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = NavyBorder)
                Spacer(modifier = Modifier.height(12.dp))

                AppDestination.values().forEach { destination ->
                    val isSelected = currentDestination == destination
                    NavigationDrawerItem(
                        icon = {
                            if (destination == AppDestination.INBOX && unreadEmailCount > 0) {
                                BadgedBox(badge = { Badge(containerColor = GoldPrimary) { Text("$unreadEmailCount", color = Color.Black) } }) {
                                    Icon(imageVector = destination.icon, contentDescription = null)
                                }
                            } else {
                                Icon(imageVector = destination.icon, contentDescription = null)
                            }
                        },
                        label = {
                            Text(
                                text = destination.label,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        selected = isSelected,
                        onClick = {
                            currentDestination = destination
                            scope.launch { drawerState.close() }
                        },
                        colors = NavigationDrawerItemDefaults.colors(
                            selectedContainerColor = NavySurface,
                            selectedIconColor = GoldLight,
                            selectedTextColor = GoldLight,
                            unselectedContainerColor = Color.Transparent,
                            unselectedIconColor = Color.White.copy(alpha = 0.7f),
                            unselectedTextColor = Color.White.copy(alpha = 0.9f)
                        ),
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.weight(1f))
                Text(
                    text = "v1.0 • Antigravity Mobile Engine",
                    color = Color.White.copy(alpha = 0.4f),
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.padding(20.dp)
                )
            }
        }
    ) {
        Scaffold(
            snackbarHost = { SnackbarHost(snackbarHostState) },
            topBar = {
                TopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "KAVIYAM",
                                color = GoldLight,
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                letterSpacing = 1.sp
                            )
                        }
                    },
                    navigationIcon = {
                        IconButton(
                            onClick = { scope.launch { drawerState.open() } },
                            modifier = Modifier.testTag("app_drawer_btn")
                        ) {
                            Icon(imageVector = Icons.Default.Menu, contentDescription = "Menu", tint = GoldLight)
                        }
                    },
                    actions = {
                        IconButton(
                            onClick = { currentDestination = AppDestination.INBOX },
                            modifier = Modifier.testTag("top_inbox_btn")
                        ) {
                            if (unreadEmailCount > 0) {
                                BadgedBox(badge = { Badge(containerColor = GoldPrimary) { Text("$unreadEmailCount", color = Color.Black) } }) {
                                    Icon(imageVector = Icons.Default.Mail, contentDescription = "Inbox", tint = Color.White)
                                }
                            } else {
                                Icon(imageVector = Icons.Default.Mail, contentDescription = "Inbox", tint = Color.White)
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = NavyDarkest
                    )
                )
            },
            bottomBar = {
                NavigationBar(
                    containerColor = NavyDark,
                    tonalElevation = 8.dp
                ) {
                    val bottomNavDestinations = listOf(
                        AppDestination.BOOKSHELF,
                        AppDestination.TAMIL,
                        AppDestination.AI_STUDIO,
                        AppDestination.INBOX,
                        AppDestination.PROFILE
                    )

                    bottomNavDestinations.forEach { dest ->
                        val isSelected = currentDestination == dest
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = { currentDestination = dest },
                            icon = {
                                if (dest == AppDestination.INBOX && unreadEmailCount > 0) {
                                    BadgedBox(badge = { Badge(containerColor = GoldPrimary) { Text("$unreadEmailCount", color = Color.Black) } }) {
                                        Icon(imageVector = dest.icon, contentDescription = dest.label)
                                    }
                                } else {
                                    Icon(imageVector = dest.icon, contentDescription = dest.label)
                                }
                            },
                            label = {
                                Text(
                                    text = dest.label,
                                    fontSize = 10.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = NavyDarkest,
                                selectedTextColor = GoldLight,
                                indicatorColor = GoldPrimary,
                                unselectedIconColor = Color.White.copy(alpha = 0.6f),
                                unselectedTextColor = Color.White.copy(alpha = 0.6f)
                            ),
                            modifier = Modifier.testTag("nav_item_${dest.name.lowercase()}")
                        )
                    }
                }
            },
            containerColor = NavyDarkest
        ) { innerPadding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                when (currentDestination) {
                    AppDestination.BOOKSHELF -> {
                        LibraryScreen(
                            viewModel = viewModel,
                            onOpenReader = { book, chapterIndex ->
                                viewModel.openReader(book, chapterIndex)
                            }
                        )
                    }
                    AppDestination.TAMIL -> {
                        TamilDashboardScreen(
                            viewModel = viewModel,
                            onOpenBook = { book ->
                                viewModel.openReader(book, 0)
                            }
                        )
                    }
                    AppDestination.AI_STUDIO -> {
                        AiBuilderScreen(
                            viewModel = viewModel,
                            onNovelCreated = { newBook ->
                                viewModel.openReader(newBook, 0)
                            }
                        )
                    }
                    AppDestination.INBOX -> {
                        EmailInboxScreen(viewModel = viewModel)
                    }
                    AppDestination.PROFILE -> {
                        ProfileScreen(viewModel = viewModel)
                    }
                    AppDestination.ADMIN -> {
                        AdminScreen(viewModel = viewModel)
                    }
                    AppDestination.FEEDBACK -> {
                        FeedbackScreen(viewModel = viewModel)
                    }
                }
            }
        }
    }
}
