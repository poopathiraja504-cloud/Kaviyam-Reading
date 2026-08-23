package com.example.kaviyam.util

import android.content.Context
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Locale

class KaviyamTts(context: Context) : TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = TextToSpeech(context.applicationContext, this)
    private var isInitialized = false

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _currentSpeed = MutableStateFlow(1.0f)
    val currentSpeed: StateFlow<Float> = _currentSpeed.asStateFlow()

    private val _currentPitch = MutableStateFlow(1.0f)
    val currentPitch: StateFlow<Float> = _currentPitch.asStateFlow()

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isInitialized = true
            tts?.setSpeechRate(_currentSpeed.value)
            tts?.setPitch(_currentPitch.value)

            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    _isPlaying.value = true
                }

                override fun onDone(utteranceId: String?) {
                    _isPlaying.value = false
                }

                override fun onError(utteranceId: String?) {
                    _isPlaying.value = false
                }
            })
        }
    }

    fun speak(text: String, isTamil: Boolean = false) {
        if (!isInitialized) return
        stop()

        val locale = if (isTamil) Locale("ta", "IN") else Locale.ENGLISH
        val result = tts?.setLanguage(locale)
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
            tts?.setLanguage(Locale.ENGLISH)
        }

        tts?.setSpeechRate(_currentSpeed.value)
        tts?.setPitch(_currentPitch.value)

        _isPlaying.value = true
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "KaviyamNarrationUtterance")
    }

    fun stop() {
        if (isInitialized) {
            tts?.stop()
        }
        _isPlaying.value = false
    }

    fun setSpeed(speed: Float) {
        _currentSpeed.value = speed
        if (isInitialized) {
            tts?.setSpeechRate(speed)
        }
    }

    fun setPitch(pitch: Float) {
        _currentPitch.value = pitch
        if (isInitialized) {
            tts?.setPitch(pitch)
        }
    }

    fun shutdown() {
        stop()
        tts?.shutdown()
        tts = null
    }
}
