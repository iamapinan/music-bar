-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keep class ai.gracer.musicbar.MainActivity$AndroidBridge { *; }
-keep class ai.gracer.musicbar.BackgroundAudioService$LocalBinder { *; }
