package ai.gracer.musicbar

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.MediaMetadata
import android.media.session.MediaSession
import android.media.session.PlaybackState
import android.net.wifi.WifiManager
import android.os.Binder
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.webkit.WebView
import java.lang.ref.WeakReference
import java.net.URL

class BackgroundAudioService : Service() {

    private val binder = LocalBinder()
    private var wakeLock: PowerManager.WakeLock? = null
    private var wifiLock: WifiManager.WifiLock? = null
    private var webViewRef: WeakReference<WebView>? = null
    private var mediaSession: MediaSession? = null
    private var lastBitmap: Bitmap? = null
    private var currentThumbnailUrl = ""

    companion object {
        const val CHANNEL_ID = "MusicBarBackgroundChannel"
        const val NOTIFICATION_ID = 8888
        const val ACTION_EXIT = "ai.gracer.musicbar.ACTION_EXIT"
        const val ACTION_STOP_ACTIVITY = "ai.gracer.musicbar.ACTION_STOP_ACTIVITY"
        const val ACTION_PLAY = "ai.gracer.musicbar.ACTION_PLAY"
        const val ACTION_PAUSE = "ai.gracer.musicbar.ACTION_PAUSE"
        const val ACTION_NEXT = "ai.gracer.musicbar.ACTION_NEXT"
        const val ACTION_PREV = "ai.gracer.musicbar.ACTION_PREV"
    }

    inner class LocalBinder : Binder() {
        fun getService(): BackgroundAudioService = this@BackgroundAudioService
    }

    override fun onBind(intent: Intent?): IBinder {
        return binder
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        acquireLocks()
        setupMediaSession()
    }

    private fun setupMediaSession() {
        mediaSession = MediaSession(this, "MusicBar").apply {
            isActive = true
            setCallback(object : MediaSession.Callback() {
                override fun onPlay() {
                    triggerWebAction("play")
                }

                override fun onPause() {
                    triggerWebAction("pause")
                }

                override fun onSkipToNext() {
                    triggerWebAction("next")
                }

                override fun onSkipToPrevious() {
                    triggerWebAction("previous")
                }
            })
        }
    }

    fun setWebView(webView: WebView) {
        webViewRef = WeakReference(webView)
    }

    private fun triggerWebAction(action: String) {
        val webView = webViewRef?.get()
        if (webView != null) {
            webView.post {
                webView.evaluateJavascript("window.handleAndroidMediaAction('$action')", null)
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_EXIT -> {
                stopServiceAndApp()
                return START_NOT_STICKY
            }
            ACTION_PLAY -> {
                triggerWebAction("play")
            }
            ACTION_PAUSE -> {
                triggerWebAction("pause")
            }
            ACTION_NEXT -> {
                triggerWebAction("next")
            }
            ACTION_PREV -> {
                triggerWebAction("previous")
            }
        }

        startForegroundService()
        return START_STICKY
    }

    fun updatePlaybackState(isPlaying: Boolean, title: String, artist: String, thumbnailUrl: String, position: Long, duration: Long) {
        val state = if (isPlaying) PlaybackState.STATE_PLAYING else PlaybackState.STATE_PAUSED
        val actions = PlaybackState.ACTION_PLAY or PlaybackState.ACTION_PAUSE or 
                      PlaybackState.ACTION_SKIP_TO_NEXT or PlaybackState.ACTION_SKIP_TO_PREVIOUS or
                      PlaybackState.ACTION_STOP
                      
        val playbackState = PlaybackState.Builder()
            .setState(state, position * 1000, 1.0f)
            .setActions(actions)
            .build()
        
        mediaSession?.setPlaybackState(playbackState)
        updateMetadataAndNotification(title, artist, thumbnailUrl, duration, isPlaying)
    }

    private fun updateMetadataAndNotification(title: String, artist: String, thumbnailUrl: String, duration: Long, isPlaying: Boolean) {
        if (thumbnailUrl.isNotEmpty() && thumbnailUrl != currentThumbnailUrl) {
            currentThumbnailUrl = thumbnailUrl
            Thread {
                val bitmap = downloadBitmap(thumbnailUrl)
                lastBitmap = bitmap
                android.os.Handler(android.os.Looper.getMainLooper()).post {
                    val meta = MediaMetadata.Builder()
                        .putString(MediaMetadata.METADATA_KEY_TITLE, title)
                        .putString(MediaMetadata.METADATA_KEY_ARTIST, artist)
                        .putString(MediaMetadata.METADATA_KEY_ALBUM, "Music Bar")
                        .putLong(MediaMetadata.METADATA_KEY_DURATION, duration * 1000)
                    if (bitmap != null) {
                        meta.putBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART, bitmap)
                    }
                    mediaSession?.setMetadata(meta.build())
                    updateNotification(title, artist, bitmap, isPlaying)
                }
            }.start()
        } else {
            val meta = MediaMetadata.Builder()
                .putString(MediaMetadata.METADATA_KEY_TITLE, title)
                .putString(MediaMetadata.METADATA_KEY_ARTIST, artist)
                .putString(MediaMetadata.METADATA_KEY_ALBUM, "Music Bar")
                .putLong(MediaMetadata.METADATA_KEY_DURATION, duration * 1000)
            if (lastBitmap != null) {
                meta.putBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART, lastBitmap)
            }
            mediaSession?.setMetadata(meta.build())
            updateNotification(title, artist, lastBitmap, isPlaying)
        }
    }

    private fun downloadBitmap(urlString: String): Bitmap? {
        return try {
            val url = URL(urlString)
            val connection = url.openConnection()
            connection.connectTimeout = 3000
            connection.readTimeout = 3000
            connection.getInputStream().use { inputStream ->
                BitmapFactory.decodeStream(inputStream)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun updateNotification(title: String, artist: String, albumArt: Bitmap?, isPlaying: Boolean) {
        val mainIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, mainIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val exitIntent = Intent(this, BackgroundAudioService::class.java).apply {
            action = ACTION_EXIT
        }
        val exitPendingIntent = PendingIntent.getService(
            this, 1, exitIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val playPauseIntent = Intent(this, BackgroundAudioService::class.java).apply {
            action = if (isPlaying) ACTION_PAUSE else ACTION_PLAY
        }
        val playPausePendingIntent = PendingIntent.getService(
            this, 2, playPauseIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val nextIntent = Intent(this, BackgroundAudioService::class.java).apply {
            action = ACTION_NEXT
        }
        val nextPendingIntent = PendingIntent.getService(
            this, 3, nextIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val prevIntent = Intent(this, BackgroundAudioService::class.java).apply {
            action = ACTION_PREV
        }
        val prevPendingIntent = PendingIntent.getService(
            this, 4, prevIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val playPauseIcon = if (isPlaying) android.R.drawable.ic_media_pause else android.R.drawable.ic_media_play
        val playPauseTitle = if (isPlaying) "Pause" else "Play"

        val notificationBuilder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        notificationBuilder
            .setContentTitle(title)
            .setContentText(artist)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setCategory(Notification.CATEGORY_SERVICE)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            
        if (albumArt != null) {
            notificationBuilder.setLargeIcon(albumArt)
        }

        notificationBuilder.addAction(
            Notification.Action.Builder(
                android.R.drawable.ic_media_previous,
                "Previous",
                prevPendingIntent
            ).build()
        )
        notificationBuilder.addAction(
            Notification.Action.Builder(
                playPauseIcon,
                playPauseTitle,
                playPausePendingIntent
            ).build()
        )
        notificationBuilder.addAction(
            Notification.Action.Builder(
                android.R.drawable.ic_media_next,
                "Next",
                nextPendingIntent
            ).build()
        )
        notificationBuilder.addAction(
            Notification.Action.Builder(
                android.R.drawable.ic_menu_close_clear_cancel,
                getString(R.string.exit_action),
                exitPendingIntent
            ).build()
        )

        val mediaStyle = Notification.MediaStyle()
            .setMediaSession(mediaSession?.sessionToken)
            .setShowActionsInCompactView(0, 1, 2)
        
        notificationBuilder.setStyle(mediaStyle)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, notificationBuilder.build())
    }

    private fun startForegroundService() {
        val notification = createNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun createNotification(): Notification {
        val mainIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, mainIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val exitIntent = Intent(this, BackgroundAudioService::class.java).apply {
            action = ACTION_EXIT
        }
        val exitPendingIntent = PendingIntent.getService(
            this, 1, exitIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notificationBuilder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        notificationBuilder
            .setContentTitle(getString(R.string.notification_title))
            .setContentText(getString(R.string.notification_description))
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setCategory(Notification.CATEGORY_SERVICE)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .addAction(
                Notification.Action.Builder(
                    android.R.drawable.ic_menu_close_clear_cancel,
                    getString(R.string.exit_action),
                    exitPendingIntent
                ).build()
            )

        val mediaStyle = Notification.MediaStyle()
            .setMediaSession(mediaSession?.sessionToken)
            .setShowActionsInCompactView(0)
        
        notificationBuilder.setStyle(mediaStyle)

        return notificationBuilder.build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = getString(R.string.notification_title)
            val descriptionText = getString(R.string.notification_description)
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
                setShowBadge(false)
            }
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun acquireLocks() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MusicBar::BackgroundWakeLock").apply {
            setReferenceCounted(false)
            acquire()
        }

        val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        wifiLock = wifiManager.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "MusicBar::BackgroundWifiLock").apply {
            setReferenceCounted(false)
            acquire()
        }
    }

    private fun releaseLocks() {
        try {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            wakeLock = null
        }

        try {
            if (wifiLock?.isHeld == true) {
                wifiLock?.release()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            wifiLock = null
        }
    }

    private fun stopServiceAndApp() {
        releaseLocks()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()

        val stopBroadcast = Intent(ACTION_STOP_ACTIVITY)
        sendBroadcast(stopBroadcast)
    }

    override fun onDestroy() {
        releaseLocks()
        mediaSession?.let {
            it.isActive = false
            it.release()
        }
        super.onDestroy()
    }
}
