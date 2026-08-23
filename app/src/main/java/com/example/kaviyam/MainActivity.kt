package com.example.kaviyam

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import com.example.kaviyam.ui.KaviyamApp
import com.example.kaviyam.ui.theme.KaviyamTheme
import com.example.kaviyam.ui.viewmodel.KaviyamViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: KaviyamViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            KaviyamTheme {
                KaviyamApp(viewModel = viewModel)
            }
        }
    }
}
