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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
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
import com.example.kaviyam.data.models.SecurityLog
import com.example.kaviyam.ui.theme.EmeraldSuccess
import com.example.kaviyam.ui.theme.GoldLight
import com.example.kaviyam.ui.theme.GoldPrimary
import com.example.kaviyam.ui.theme.NavyBorder
import com.example.kaviyam.ui.theme.NavyCard
import com.example.kaviyam.ui.theme.NavyDarkest
import com.example.kaviyam.ui.theme.NavySurface
import com.example.kaviyam.ui.theme.RedAlert
import com.example.kaviyam.ui.viewmodel.KaviyamViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class AdminUser(
    val id: String,
    val name: String,
    val email: String,
    val role: String,
    val isVerified: Boolean,
    var isBlocked: Boolean
)

@Composable
fun AdminScreen(
    viewModel: KaviyamViewModel
) {
    val allBooks by viewModel.allBooks.collectAsStateWithLifecycle()
    val securityLogs by viewModel.securityLogs.collectAsStateWithLifecycle()

    var userSearch by remember { mutableStateOf("") }
    var mockUsers by remember {
        mutableStateOf(
            listOf(
                AdminUser("usr-1", "Boopathi Raja", "rajaboopathi1021@gmail.com", "Admin", true, false),
                AdminUser("usr-2", "Sundar Ramanathan", "sundar.r@example.com", "Reader", true, false),
                AdminUser("usr-3", "Meenakshi V", "meenakshi.v@example.com", "Author", true, false),
                AdminUser("usr-4", "Karthik Raja", "karthik.r@example.com", "Reader", false, false),
                AdminUser("usr-5", "Ananya Swaminathan", "ananya.s@example.com", "Reader", true, false)
            )
        )
    }

    val totalBooks = allBooks.size
    val aiBooksCount = allBooks.count { it.isCustomAI }
    val tamilClassicsCount = allBooks.count { it.isTamilClassic }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDarkest)
            .padding(16.dp)
            .testTag("admin_screen_root")
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
                        imageVector = Icons.Default.AdminPanelSettings,
                        contentDescription = null,
                        tint = GoldLight,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Admin & Security Center",
                        color = GoldLight,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                    Text(
                        text = "Platform analytics, account controls & audit telemetry",
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 12.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Platform Analytics Metric Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                AdminMetricCard(
                    title = "Total Users",
                    value = "${mockUsers.size}",
                    subtitle = "100% Active",
                    modifier = Modifier.weight(1f)
                )
                AdminMetricCard(
                    title = "Catalog",
                    value = "$totalBooks",
                    subtitle = "$tamilClassicsCount Classics",
                    modifier = Modifier.weight(1f)
                )
                AdminMetricCard(
                    title = "AI Stories",
                    value = "$aiBooksCount",
                    subtitle = "Synthesized",
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Genre Distribution
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NavyCard)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Bookshelf Genre Composition",
                        color = GoldLight,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    GenreProgressRow("Tamil Classics", tamilClassicsCount, totalBooks)
                    GenreProgressRow("AI Synthesized", aiBooksCount, totalBooks)
                    GenreProgressRow("Fantasy & Sci-Fi", totalBooks - tamilClassicsCount - aiBooksCount, totalBooks)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // User Management Table Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "User Accounts Management",
                    color = Color.White,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp
                )
                Text(
                    text = "${mockUsers.size} Registered",
                    color = GoldLight,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedTextField(
                value = userSearch,
                onValueChange = { userSearch = it },
                placeholder = { Text("Filter accounts by name or email...", color = Color.Gray, fontSize = 12.sp) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                leadingIcon = { Icon(imageVector = Icons.Default.Search, contentDescription = null, tint = GoldLight) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = GoldPrimary,
                    unfocusedBorderColor = NavyBorder,
                    focusedContainerColor = NavySurface,
                    unfocusedContainerColor = NavySurface
                )
            )

            Spacer(modifier = Modifier.height(12.dp))
        }

        // Users List
        val filteredUsers = mockUsers.filter {
            userSearch.isBlank() || it.name.contains(userSearch, true) || it.email.contains(userSearch, true)
        }

        items(filteredUsers) { user ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(NavySurface)
                    .border(1.dp, NavyBorder, RoundedCornerShape(12.dp))
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = user.name,
                            color = if (user.isBlocked) RedAlert else Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .background(GoldPrimary.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(text = user.role, color = GoldLight, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Text(
                        text = user.email,
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 11.sp
                    )
                }

                Button(
                    onClick = {
                        mockUsers = mockUsers.map {
                            if (it.id == user.id) it.copy(isBlocked = !it.isBlocked) else it
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (user.isBlocked) EmeraldSuccess else RedAlert.copy(alpha = 0.8f),
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = if (user.isBlocked) "Unblock" else "Block",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Global Audit Trail
        item {
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = "System & Security Audit Log",
                color = Color.White,
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
                fontSize = 17.sp
            )
            Spacer(modifier = Modifier.height(10.dp))
        }

        items(securityLogs) { log ->
            val dateFormat = SimpleDateFormat("MMM dd, HH:mm:ss", Locale.getDefault())
            val timeStr = dateFormat.format(Date(log.timestamp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 3.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(NavySurface)
                    .padding(10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = log.action,
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "${log.ip} • $timeStr",
                        color = Color.White.copy(alpha = 0.5f),
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
                Box(
                    modifier = Modifier
                        .background(EmeraldSuccess.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = log.status,
                        color = EmeraldSuccess,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

@Composable
private fun AdminMetricCard(
    title: String,
    value: String,
    subtitle: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = NavyCard)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            Text(text = title, color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = value, color = GoldLight, fontWeight = FontWeight.Bold, fontSize = 20.sp)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = subtitle, color = EmeraldSuccess, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun GenreProgressRow(genre: String, count: Int, total: Int) {
    val progress = if (total > 0) count.toFloat() / total else 0f
    Column(modifier = Modifier.padding(vertical = 4.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(text = genre, color = Color.White, fontSize = 12.sp)
            Text(text = "$count vols (${(progress * 100).toInt()}%)", color = GoldLight, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
        }
        Spacer(modifier = Modifier.height(4.dp))
        LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp)
                .clip(RoundedCornerShape(2.dp)),
            color = GoldPrimary,
            trackColor = NavyBorder
        )
    }
}
