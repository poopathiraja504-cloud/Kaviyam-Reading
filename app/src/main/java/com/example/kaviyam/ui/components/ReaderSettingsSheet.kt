package com.example.kaviyam.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FormatSize
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
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
import com.example.kaviyam.ui.theme.NavyDark
import com.example.kaviyam.ui.theme.NavySurface
import com.example.kaviyam.ui.theme.ParchmentBg
import com.example.kaviyam.ui.theme.SepiaBg
import com.example.kaviyam.ui.viewmodel.ReaderFontFamily
import com.example.kaviyam.ui.viewmodel.ReaderSettings
import com.example.kaviyam.ui.viewmodel.ReaderTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderSettingsSheet(
    settings: ReaderSettings,
    onDismiss: () -> Unit,
    onThemeChange: (ReaderTheme) -> Unit,
    onFontSizeDelta: (Float) -> Unit,
    onFontFamilyChange: (ReaderFontFamily) -> Unit,
    onLineHeightChange: (Float) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = NavyDark,
        dragHandle = null,
        modifier = Modifier.testTag("reader_settings_sheet")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Display & Typography",
                    color = GoldLight,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )

                IconButton(onClick = onDismiss) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Reading Theme Selector
            Text(
                text = "Reading Canvas Theme",
                color = Color.White.copy(alpha = 0.8f),
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ThemeOptionCard(
                    title = "Midnight",
                    bgColor = Color(0xFF091122),
                    textColor = Color.White,
                    isSelected = settings.theme == ReaderTheme.MIDNIGHT,
                    onClick = { onThemeChange(ReaderTheme.MIDNIGHT) },
                    modifier = Modifier.weight(1f)
                )

                ThemeOptionCard(
                    title = "Parchment",
                    bgColor = ParchmentBg,
                    textColor = Color(0xFF2C2214),
                    isSelected = settings.theme == ReaderTheme.PARCHMENT,
                    onClick = { onThemeChange(ReaderTheme.PARCHMENT) },
                    modifier = Modifier.weight(1f)
                )

                ThemeOptionCard(
                    title = "Sepia",
                    bgColor = SepiaBg,
                    textColor = Color(0xFF3B2F21),
                    isSelected = settings.theme == ReaderTheme.SEPIA,
                    onClick = { onThemeChange(ReaderTheme.SEPIA) },
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))
            HorizontalDivider(color = NavyBorder)
            Spacer(modifier = Modifier.height(16.dp))

            // Font Size Controls
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Font Size (${settings.fontSizeSp.toInt()} sp)",
                    color = Color.White.copy(alpha = 0.8f),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = { onFontSizeDelta(-1.5f) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = NavySurface,
                            contentColor = GoldLight
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("A-", fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = { onFontSizeDelta(1.5f) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = NavySurface,
                            contentColor = GoldLight
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("A+", fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Font Family Selector
            Text(
                text = "Typeface",
                color = Color.White.copy(alpha = 0.8f),
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ReaderFontFamily.values().forEach { family ->
                    val isSelected = settings.fontFamily == family
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSelected) GoldPrimary else NavySurface)
                            .border(1.dp, if (isSelected) GoldLight else NavyBorder, RoundedCornerShape(10.dp))
                            .clickable { onFontFamilyChange(family) }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = family.name.replace("_", " "),
                            color = if (isSelected) Color.Black else Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = when (family) {
                                ReaderFontFamily.SERIF -> FontFamily.Serif
                                ReaderFontFamily.SANS_SERIF -> FontFamily.Default
                                ReaderFontFamily.MONOSPACE -> FontFamily.Monospace
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
private fun ThemeOptionCard(
    title: String,
    bgColor: Color,
    textColor: Color,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .border(
                width = if (isSelected) 2.dp else 1.dp,
                color = if (isSelected) GoldLight else NavyBorder,
                shape = RoundedCornerShape(12.dp)
            )
            .clickable(onClick = onClick)
            .padding(vertical = 14.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = title,
            color = textColor,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
