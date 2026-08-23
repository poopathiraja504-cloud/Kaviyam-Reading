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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.MarkEmailRead
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.example.kaviyam.data.models.SimulatedEmail
import com.example.kaviyam.ui.theme.EmeraldSuccess
import com.example.kaviyam.ui.theme.GoldLight
import com.example.kaviyam.ui.theme.GoldPrimary
import com.example.kaviyam.ui.theme.NavyBorder
import com.example.kaviyam.ui.theme.NavyCard
import com.example.kaviyam.ui.theme.NavyDark
import com.example.kaviyam.ui.theme.NavyDarkest
import com.example.kaviyam.ui.theme.NavySurface
import com.example.kaviyam.ui.theme.RedAlert
import com.example.kaviyam.ui.viewmodel.KaviyamViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun EmailInboxScreen(
    viewModel: KaviyamViewModel
) {
    val emails by viewModel.emails.collectAsStateWithLifecycle()
    var selectedEmail by remember { mutableStateOf<SimulatedEmail?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDarkest)
            .padding(16.dp)
            .testTag("email_inbox_root")
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(GoldPrimary.copy(alpha = 0.15f), CircleShape)
                        .border(1.dp, GoldPrimary, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Mail,
                        contentDescription = null,
                        tint = GoldLight,
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Simulated Mailbox",
                        color = GoldLight,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                    Text(
                        text = "Captured verification tokens & security alerts",
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 12.sp
                    )
                }
            }

            Box(
                modifier = Modifier
                    .background(NavySurface, RoundedCornerShape(8.dp))
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "${emails.count { !it.read }} Unread",
                    color = GoldLight,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (emails.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No captured emails in the sandbox.",
                    color = Color.White.copy(alpha = 0.5f),
                    fontSize = 13.sp
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(emails, key = { it.id }) { email ->
                    EmailListItem(
                        email = email,
                        onClick = {
                            viewModel.markEmailRead(email.id)
                            selectedEmail = email
                        },
                        onDelete = {
                            viewModel.deleteEmail(email.id)
                        }
                    )
                }

                item {
                    Spacer(modifier = Modifier.height(40.dp))
                }
            }
        }
    }

    // Email Detail Dialog with Action Buttons
    selectedEmail?.let { email ->
        EmailDetailDialog(
            email = email,
            onDismiss = { selectedEmail = null },
            onActionClick = { action, params ->
                viewModel.triggerEmailAction(action, params)
                selectedEmail = null
            }
        )
    }
}

@Composable
private fun EmailListItem(
    email: SimulatedEmail,
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    val dateFormat = SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault())
    val dateStr = dateFormat.format(Date(email.sentAt))

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(if (email.read) NavySurface else NavyCard)
            .border(
                1.dp,
                if (!email.read) GoldPrimary.copy(alpha = 0.5f) else NavyBorder,
                RoundedCornerShape(14.dp)
            )
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .background(if (!email.read) GoldLight else Color.Transparent, CircleShape)
        )

        Spacer(modifier = Modifier.width(10.dp))

        Column(modifier = Modifier.weight(1f)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = email.subject,
                    color = if (!email.read) GoldLight else Color.White,
                    fontWeight = if (!email.read) FontWeight.Bold else FontWeight.Medium,
                    fontSize = 14.sp,
                    maxLines = 1
                )
                Text(
                    text = dateStr,
                    color = Color.White.copy(alpha = 0.5f),
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = email.body.take(80).replace("\n", " "),
                color = Color.White.copy(alpha = 0.7f),
                fontSize = 12.sp,
                maxLines = 1
            )
        }

        IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
            Icon(
                imageVector = Icons.Default.Delete,
                contentDescription = "Delete",
                tint = Color.Gray.copy(alpha = 0.6f),
                modifier = Modifier.size(16.dp)
            )
        }
    }
}

@Composable
private fun EmailDetailDialog(
    email: SimulatedEmail,
    onDismiss: () -> Unit,
    onActionClick: (String, Map<String, String>) -> Unit
) {
    // Parse actions in body like [Action: VerifyEmail; email=...]
    val actionRegex = Regex("\\[Action:\\s*([a-zA-Z0-9]+);\\s*([^\\]]+)\\]")
    val matches = actionRegex.findAll(email.body).toList()

    val cleanBody = email.body.replace(actionRegex, "").trim()

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(
                    containerColor = NavySurface,
                    contentColor = Color.White
                )
            ) {
                Text("Close")
            }
        },
        title = {
            Column {
                Text(
                    text = email.subject,
                    color = GoldLight,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                Text(
                    text = "To: ${email.recipient}",
                    color = Color.White.copy(alpha = 0.6f),
                    fontSize = 11.sp
                )
            }
        },
        text = {
            Column {
                Text(
                    text = cleanBody,
                    color = Color(0xFFE2E8F0),
                    fontSize = 13.sp,
                    lineHeight = 20.sp
                )

                if (matches.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider(color = NavyBorder)
                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Interactive Actions:",
                        color = GoldLight,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    matches.forEach { match ->
                        val actionName = match.groupValues[1].trim()
                        val paramsStr = match.groupValues[2].trim()
                        val paramsMap = paramsStr.split(";")
                            .mapNotNull {
                                val parts = it.split("=")
                                if (parts.size == 2) parts[0].trim() to parts[1].trim() else null
                            }.toMap()

                        Button(
                            onClick = { onActionClick(actionName, paramsMap) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (actionName == "VerifyEmail") EmeraldSuccess else GoldPrimary,
                                contentColor = Color.Black
                            )
                        ) {
                            Icon(
                                imageVector = if (actionName == "VerifyEmail") Icons.Default.CheckCircle else Icons.Default.Key,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = when (actionName) {
                                    "VerifyEmail" -> "Click to Verify Email Address"
                                    "ResetPassword" -> "Authenticate Password Reset Token"
                                    else -> actionName
                                },
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }
        },
        containerColor = NavyDark,
        shape = RoundedCornerShape(20.dp)
    )
}
