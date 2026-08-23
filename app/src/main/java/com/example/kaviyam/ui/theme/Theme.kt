package com.example.kaviyam.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = GoldLight,
    onPrimary = NavyDarkest,
    primaryContainer = NavyCard,
    onPrimaryContainer = GoldLight,
    secondary = AmberAccent,
    onSecondary = NavyDarkest,
    background = NavyDarkest,
    onBackground = Color(0xFFF1F5F9),
    surface = NavyDark,
    onSurface = Color(0xFFF1F5F9),
    surfaceVariant = NavySurface,
    onSurfaceVariant = Color(0xFFCBD5E1),
    outline = NavyBorder,
    error = RedAlert
)

private val LightColorScheme = lightColorScheme(
    primary = GoldDark,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFFFF8E7),
    onPrimaryContainer = Color(0xFF5A4400),
    secondary = AmberAccent,
    onSecondary = Color.White,
    background = ParchmentBg,
    onBackground = ParchmentText,
    surface = Color.White,
    onSurface = ParchmentText,
    surfaceVariant = ParchmentSurface,
    onSurfaceVariant = Color(0xFF5E5446),
    outline = Color(0xFFE2D7C3),
    error = RedAlert
)

@Composable
fun KaviyamTheme(
    darkTheme: Boolean = true, // Default to rich midnight navy gold theme
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
