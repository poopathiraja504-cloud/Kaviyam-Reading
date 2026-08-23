# Proguard rules for Kaviyam
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.* <methods>;
}
