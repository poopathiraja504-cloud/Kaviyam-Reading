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
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.example.kaviyam.data.models.Achievement
import com.example.kaviyam.data.models.UserProfile
import com.example.kaviyam.ui.theme.EmeraldSuccess
import com.example.kaviyam.ui.theme.GoldLight
import com.example.kaviyam.ui.theme.GoldPrimary
import com.example.kaviyam.ui.theme.NavyBorder
import com.example.kaviyam.ui.theme.NavyCard
import com.example.kaviyam.ui.theme.NavyDark
import com.example.kaviyam.ui.theme.NavyDarkest
import com.example.kaviyam.ui.theme.NavySurface
import com.example.kaviyam.ui.viewmodel.KaviyamViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun ProfileScreen(
    viewModel: KaviyamViewModel
) {
    val userProfile by viewModel.userProfile.collectAsStateWithLifecycle()
    val securityLogs by viewModel.securityLogs.collectAsStateWithLifecycle()
    val profile = userProfile ?: UserProfile()

    var showEditDialog by remember { mutableStateOf(false) }
    var editPenName by remember { mutableStateOf(profile.penName) }
    var editBio by remember { mutableStateOf(profile.bio) }

    val achievements = listOf(
        Achievement("ach-1", "Sangam Scholar", "Read classical Tamil literature spanning over 100 chapters.", "🏛️", true, "Unlocked"),
        Achievement("ach-2", "14-Day Streak", "Read daily without interruption for two weeks.", "🔥", true, "Unlocked"),
        Achievement("ach-3", "AI Tale Weaver", "Crafted original multi-chapter novel with Gemini.", "✨", true, "Unlocked"),
        Achievement("ach-4", "Literary Critic", "Contributed thoughtful reviews to the bookshelf.", "✍️", true, "Unlocked"),
        Achievement("ach-5", "Auditory Explorer", "Listened to Tamil classics via voice narration.", "🎧", true, "Unlocked")
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDarkest)
            .padding(16.dp)
            .testTag("profile_screen_root")
    ) {
        // User Profile Header Card
        item {
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
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .border(2.dp, GoldPrimary, CircleShape)
                        ) {
                            AsyncImage(
                                model = profile.profilePhoto,
                                contentDescription = profile.penName,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = profile.penName,
                                    color = Color.White,
                                    fontFamily = FontFamily.Serif,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 18.sp
                                )
                                if (profile.isVerified) {
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = "Verified",
                                        tint = EmeraldSuccess,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                            Text(
                                text = profile.email,
                                color = Color.White.copy(alpha = 0.6f),
                                fontSize = 12.sp
                            )
                        }

                        IconButton(
                            onClick = {
                                editPenName = profile.penName
                                editBio = profile.bio
                                showEditDialog = true
                            }
                        ) {
                            Icon(imageVector = Icons.Default.Edit, contentDescription = "Edit Profile", tint = GoldLight)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = profile.bio,
                        color = Color(0xFFCBD5E1),
                        fontSize = 12.sp,
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider(color = NavyBorder)
                    Spacer(modifier = Modifier.height(16.dp))

                    // Reading Stats Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        StatItem(value = "${profile.currentStreak} Days", label = "Daily Streak", icon = "🔥")
                        StatItem(value = "${profile.booksCompleted}", label = "Books Finished", icon = "📚")
                        StatItem(value = "${profile.totalReadMinutes} min", label = "Time Read", icon = "⏳")
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Security Hardening Center
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = NavyCard)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = null,
                            tint = GoldLight,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Security & Encryption Sandbox",
                            color = GoldLight,
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // 2FA Toggle
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(NavySurface)
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Two-Factor Authentication (2FA)",
                                color = Color.White,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp
                            )
                            Text(
                                text = if (profile.is2FAEnabled) "Active • Encrypted OTP Enforced" else "Inactive • Tap to secure account",
                                color = if (profile.is2FAEnabled) EmeraldSuccess else Color.Gray,
                                fontSize = 11.sp
                            )
                        }

                        Switch(
                            checked = profile.is2FAEnabled,
                            onCheckedChange = { viewModel.toggle2FA() },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = GoldLight,
                                checkedTrackColor = NavyBorder,
                                uncheckedThumbColor = Color.Gray,
                                uncheckedTrackColor = NavySurface
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Achievements Badges
            Text(
                text = "Literary Achievements & Badges",
                color = Color.White,
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
                fontSize = 17.sp
            )

            Spacer(modifier = Modifier.height(10.dp))
        }

        // Achievements list
        items(achievements) { ach ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(NavySurface)
                    .border(1.dp, NavyBorder, RoundedCornerShape(12.dp))
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = ach.icon, fontSize = 24.sp)
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = ach.title,
                        color = GoldLight,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                    Text(
                        text = ach.description,
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 11.sp
                    )
                }
                Box(
                    modifier = Modifier
                        .background(GoldPrimary.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = ach.unlockedDate ?: "Unlocked",
                        color = GoldLight,
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }

        // Security Activity Log
        item {
            Spacer(modifier = Modifier.height(20.dp))
            Text(
                text = "Recent Security Activity Trail",
                color = Color.White,
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
                fontSize = 17.sp
            )
            Spacer(modifier = Modifier.height(10.dp))
        }

        items(securityLogs.take(5)) { log ->
            val dateFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
            val timeStr = dateFormat.format(Date(log.timestamp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 3.dp)
                    .clip(RoundedCornerShape(10.dp))
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
                        text = "${log.device} • $timeStr",
                        color = Color.White.copy(alpha = 0.5f),
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
                Box(
                    modifier = Modifier
                        .background(EmeraldSuccess.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = log.status,
                        color = EmeraldSuccess,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(40.dp))
        }
    }

    // Edit Profile Dialog
    if (showEditDialog) {
        AlertDialog(
            onDismissRequest = { showEditDialog = false },
            title = {
                Text(
                    text = "Edit Profile",
                    color = GoldLight,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column {
                    OutlinedTextField(
                        value = editPenName,
                        onValueChange = { editPenName = it },
                        label = { Text("Author Pen Name") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = GoldPrimary,
                            unfocusedBorderColor = NavyBorder
                        )
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = editBio,
                        onValueChange = { editBio = it },
                        label = { Text("Bio") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = GoldPrimary,
                            unfocusedBorderColor = NavyBorder
                        )
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.updateProfileInfo(editPenName, editBio)
                        showEditDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = GoldPrimary,
                        contentColor = NavyDarkest
                    )
                ) {
                    Text("Save", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditDialog = false }) {
                    Text("Cancel", color = Color.White)
                }
            },
            containerColor = NavyDark,
            shape = RoundedCornerShape(20.dp)
        )
    }
}

@Composable
private fun StatItem(value: String, label: String, icon: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = icon, fontSize = 20.sp)
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = value,
            color = GoldLight,
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp
        )
        Text(
            text = label,
            color = Color.White.copy(alpha = 0.6f),
            fontSize = 11.sp
        )
    }
}
