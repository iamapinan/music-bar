package ai.gracer.musicbar

import android.Manifest
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.ServiceConnection
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.drawable.GradientDrawable
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.LruCache
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.util.concurrent.Executors
import java.util.concurrent.Future
import kotlin.math.max
import kotlin.math.min

class MainActivity : AppCompatActivity(), BackgroundAudioService.NativeActionHandler {

    // ---- Views ----
    private lateinit var artworkFrame: FrameLayout
    private lateinit var stationSelectView: ScrollView
    private lateinit var playerView: ScrollView
    private lateinit var stationContent: LinearLayout
    private lateinit var playerContent: LinearLayout
    private lateinit var stationList: LinearLayout
    private lateinit var stationLabel: TextView
    private lateinit var statusLabel: TextView
    private lateinit var artworkView: ImageView
    private lateinit var songTitle: TextView
    private lateinit var songArtist: TextView
    private lateinit var progress: ProgressBar
    private lateinit var currentTimeLabel: TextView
    private lateinit var durationLabel: TextView
    private lateinit var playPauseButton: ImageButton
    private lateinit var previousButton: ImageButton
    private lateinit var nextButton: ImageButton
    private lateinit var queueList: LinearLayout
    private lateinit var stationSelectTitle: TextView
    private lateinit var stationSelectSubtitle: TextView
    private lateinit var crossfadeLabel: TextView

    // ---- State ----
    private var audioService: BackgroundAudioService? = null
    private var isBound = false
    private var mediaPlayer: MediaPlayer? = null
    private var fadingPlayer: MediaPlayer? = null
    private var songs: List<NativeSong> = emptyList()
    private var currentIndex = 0
    private var isPlaying = false
    private var isPreparing = false
    private var durationMs = 0
    private var resumePositionMs = 0
    private var tenantSlug = ""
    private var activePlaylistSignature = ""
    private val selectedPlaylistIds = mutableListOf<Int>()
    private val mainHandler = Handler(Looper.getMainLooper())
    private val prefs by lazy { getSharedPreferences("musicbar_native_player", Context.MODE_PRIVATE) }

    private val baseUrl = "https://musicbar.gracer.ai"
    private val crossfadeMs = 5000

    // ---- Performance: Thread pool & lifecycle ----
    private val backgroundExecutor = Executors.newSingleThreadExecutor()
    private var pendingFuture: Future<*>? = null
    private var isDestroyed = false

    // ---- Performance: Bitmap LRU cache (4MB) ----
    private val bitmapCache: LruCache<String, Bitmap> = object : LruCache<String, Bitmap>(4 * 1024 * 1024) {
        override fun sizeOf(key: String, value: Bitmap): Int {
            return value.byteCount
        }
    }

    // ---- Tickers ----
    private val progressTicker = object : Runnable {
        override fun run() {
            if (isDestroyed) return
            if (playerView.visibility == View.VISIBLE) {
                updateProgressFromPlayer()
                savePlaybackState()
            }
            mainHandler.postDelayed(this, 1000)
        }
    }

    private val activePlaylistTicker = object : Runnable {
        override fun run() {
            if (isDestroyed || playerView.visibility != View.VISIBLE) return
            refreshActivePlaylistIfNeeded()
            mainHandler.postDelayed(this, 60000) // reduced from 30s to 60s
        }
    }

    // ---- Service Connection ----
    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as BackgroundAudioService.LocalBinder
            audioService = binder.getService()
            isBound = true
            audioService?.setNativeActionHandler(this@MainActivity)
            syncNotification()
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            audioService = null
            isBound = false
        }
    }

    private val stopReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == BackgroundAudioService.ACTION_STOP_ACTIVITY) {
                finishAndRemoveTask()
            }
        }
    }

    // ===================== Lifecycle =====================

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
        )
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        enableFullscreenMode()
        setContentView(R.layout.activity_main)
        bindViews()
        makeResponsive()
        setupNativeControls()
        requestRuntimePermissions()
        registerStopReceiver()
        startAudioService()
        bindAudioService()
        loadStations()
        mainHandler.post(progressTicker)
        mainHandler.postDelayed(activePlaylistTicker, 60000)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) enableFullscreenMode()
    }

    override fun onPause() {
        savePlaybackState()
        super.onPause()
    }

    override fun onBackPressed() {
        if (playerView.visibility == View.VISIBLE) {
            playerView.visibility = View.GONE
            stationSelectView.visibility = View.VISIBLE
        } else {
            moveTaskToBack(true)
        }
    }

    override fun onDestroy() {
        isDestroyed = true
        savePlaybackState()
        mainHandler.removeCallbacks(progressTicker)
        mainHandler.removeCallbacks(activePlaylistTicker)
        // Cancel pending background work
        pendingFuture?.cancel(true)
        backgroundExecutor.shutdownNow()
        try {
            unregisterReceiver(stopReceiver)
        } catch (_: Exception) {}
        if (isBound) {
            unbindService(serviceConnection)
            isBound = false
        }
        releasePlayer()
        bitmapCache.evictAll()
        super.onDestroy()
    }

    // ===================== View Binding =====================

    private fun bindViews() {
        stationSelectView = findViewById(R.id.stationSelectView)
        playerView = findViewById(R.id.playerView)
        stationContent = findViewById(R.id.stationContent)
        playerContent = findViewById(R.id.playerContent)
        stationList = findViewById(R.id.stationList)
        artworkFrame = findViewById(R.id.artworkFrame)
        stationLabel = findViewById(R.id.stationLabel)
        statusLabel = findViewById(R.id.statusLabel)
        artworkView = findViewById(R.id.artworkView)
        songTitle = findViewById(R.id.songTitle)
        songArtist = findViewById(R.id.songArtist)
        progress = findViewById(R.id.playbackProgress)
        currentTimeLabel = findViewById(R.id.currentTimeLabel)
        durationLabel = findViewById(R.id.durationLabel)
        playPauseButton = findViewById(R.id.playPauseButton)
        previousButton = findViewById(R.id.previousButton)
        nextButton = findViewById(R.id.nextButton)
        queueList = findViewById(R.id.queueList)
        stationSelectTitle = findViewById(R.id.stationSelectTitle)
        stationSelectSubtitle = findViewById(R.id.stationSelectSubtitle)
        crossfadeLabel = findViewById(R.id.crossfadeLabel)
    }

    private fun makeResponsive() {
        val width = resources.displayMetrics.widthPixels
        val density = resources.displayMetrics.density
        val maxContentPx = (680 * density).toInt()
        val contentWidth = min(width - (48 * density).toInt(), maxContentPx).coerceAtLeast((280 * density).toInt())
        stationContent.layoutParams = stationContent.layoutParams.apply { this.width = contentWidth }
        playerContent.layoutParams = playerContent.layoutParams.apply { this.width = contentWidth }

        val maxArtworkPx = (if (width / density >= 720) 360 else 320) * density
        val minArtworkPx = (220 * density).toInt()
        val size = min(maxArtworkPx.toInt(), max(minArtworkPx, contentWidth - (72 * density).toInt()))
        artworkFrame.layoutParams = artworkFrame.layoutParams.apply {
            this.width = size
            this.height = size
        }
    }

    // ===================== Controls =====================

    private fun setupNativeControls() {
        playPauseButton.setOnClickListener {
            if (isPlaying) pause() else play()
        }
        nextButton.setOnClickListener { next(useCrossfade = true) }
        previousButton.setOnClickListener { previous() }
    }

    // ===================== Station Loading =====================

    private fun loadStations() {
        stationList.removeAllViews()
        stationList.addView(loadingRow("กำลังโหลดสถานี"))
        pendingFuture = backgroundExecutor.submit {
            try {
                val stations = stationListFromApi()
                runOnUiThread { if (!isDestroyed) renderStationPicker(stations) }
            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    if (isDestroyed) return@runOnUiThread
                    stationList.removeAllViews()
                    stationList.addView(loadingRow("โหลดสถานีไม่สำเร็จ: ${e.message ?: "unknown error"}"))
                }
            }
        }
    }

    private fun renderStationPicker(stations: List<NativeStation>) {
        stationList.removeAllViews()
        if (stations.isEmpty()) {
            val row = loadingRow("ยังไม่มีสถานีที่เปิดใช้งาน")
            row.gravity = android.view.Gravity.CENTER
            stationList.addView(row)
            return
        }

        val savedTenant = prefs.getString(KEY_TENANT, null)
        stations.forEach { station ->
            // --- Thumbnail (circle crop) ---
            val thumbnail = ImageView(this).apply {
                layoutParams = LinearLayout.LayoutParams(dp(52), dp(52))
                scaleType = ImageView.ScaleType.CENTER_CROP
                setImageResource(R.drawable.ic_music_note)
                if (station.coverThumbnail.isNotBlank()) {
                    loadBitmap(station.coverThumbnail, this)
                }
            }

            // --- Station name ---
            val title = TextView(this).apply {
                text = station.displayName
                setTextColor(ContextCompat.getColor(this@MainActivity, R.color.cloud_white))
                textSize = 17f
                setTypeface(typeface, android.graphics.Typeface.BOLD)
                maxLines = 1
                gravity = android.view.Gravity.START
            }

            // --- Meta info ---
            val meta = TextView(this).apply {
                val resumeHint = if (station.slug == savedTenant) " • เล่นต่อจากครั้งล่าสุด" else ""
                text = "${station.songCount} เพลง • ${station.playlistCount} Playlist$resumeHint"
                setTextColor(ContextCompat.getColor(this@MainActivity, R.color.slate_300))
                textSize = 12f
                maxLines = 1
            }

            // --- Text column ---
            val textColumn = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                    marginStart = dp(14)
                }
                addView(title)
                addView(meta.apply {
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply { topMargin = dp(3) }
                })
            }

            // --- Card body (horizontal) ---
            val cardBody = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = android.view.Gravity.CENTER_VERTICAL
                setPadding(dp(16), dp(14), dp(16), dp(14))
                addView(thumbnail)
                addView(textColumn)
            }

            // --- Full card ---
            val card = FrameLayout(this).apply {
                background = ContextCompat.getDrawable(this@MainActivity, R.drawable.bg_queue_row)
                addView(cardBody)
                setOnClickListener { selectStation(station) }
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                ).apply { bottomMargin = dp(12) }
            }

            stationList.addView(card)
        }
    }

    private fun loadingRow(text: String): TextView {
        return TextView(this).apply {
            this.text = text
            setTextColor(ContextCompat.getColor(this@MainActivity, R.color.slate_300))
            textSize = 14f
            background = ContextCompat.getDrawable(this@MainActivity, R.drawable.bg_queue_row)
            setPadding(dp(18), dp(16), dp(18), dp(16))
        }
    }

    private fun stationListFromApi(): List<NativeStation> {
        val json = getJson("$baseUrl/api/stations")
        val stations = JSONArray(json)
        return (0 until stations.length()).map { index ->
            val item = stations.getJSONObject(index)
            NativeStation(
                id = item.optString("id", ""),
                slug = item.optString("slug", ""),
                name = item.optString("name", "Music Bar"),
                displayName = item.optString("display_name", item.optString("name", "Music Bar")).ifBlank {
                    item.optString("name", "Music Bar")
                },
                logoUrl = item.optString("logo_url", ""),
                coverThumbnail = item.optString("cover_thumbnail", ""),
                playlistCount = item.optInt("playlist_count", 0),
                songCount = item.optInt("song_count", 0),
            )
        }.filter { it.slug.isNotBlank() }
    }

    // ===================== Station Selection =====================

    private fun selectStation(station: NativeStation) {
        stationSelectView.visibility = View.GONE
        playerView.visibility = View.VISIBLE
        releasePlayer()
        isPlaying = false
        isPreparing = false
        tenantSlug = station.slug
        stationLabel.text = station.displayName
        statusLabel.text = "กำลังโหลด active playlist"
        songTitle.text = "กำลังโหลดเพลง"
        songArtist.text = station.displayName
        artworkView.setImageResource(R.drawable.ic_music_note)
        updatePlayPauseIcon()

        pendingFuture = backgroundExecutor.submit {
            try {
                val tenantParam = URLEncoder.encode(station.slug, "UTF-8")
                val playlistIds = activePlaylistIds(tenantParam)
                val loadedSongs = loadSongsForPlaylists(tenantParam, playlistIds)
                val canRestore = prefs.getString(KEY_TENANT, null) == station.slug
                val restoredSongId = if (canRestore) prefs.getString(KEY_SONG_ID, null) else null
                val restoredPosition = if (canRestore) prefs.getInt(KEY_POSITION_MS, 0) else 0
                val shouldContinue = canRestore && prefs.getBoolean(KEY_WAS_PLAYING, false)
                runOnUiThread {
                    if (isDestroyed) return@runOnUiThread
                    selectedPlaylistIds.clear()
                    selectedPlaylistIds.addAll(playlistIds)
                    activePlaylistSignature = playlistIds.joinToString(",")
                    songs = loadedSongs
                    currentIndex = songs.indexOfFirst { it.stableId == restoredSongId }.takeIf { it >= 0 } ?: 0
                    resumePositionMs = restoredPosition
                    if (songs.isEmpty()) {
                        showError("active playlist ยังไม่มีเพลง")
                    } else {
                        renderCurrentSong()
                        if (shouldContinue) play()
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                showError("โหลด API ไม่สำเร็จ: ${e.message ?: "unknown error"}")
            }
        }
    }

    private fun refreshActivePlaylistIfNeeded() {
        if (tenantSlug.isBlank()) return
        pendingFuture = backgroundExecutor.submit {
            try {
                val tenantParam = URLEncoder.encode(tenantSlug, "UTF-8")
                val playlistIds = activePlaylistIds(tenantParam)
                val signature = playlistIds.joinToString(",")
                if (signature == activePlaylistSignature) return@submit
                val oldSongId = songs.getOrNull(currentIndex)?.stableId
                val loadedSongs = loadSongsForPlaylists(tenantParam, playlistIds)
                runOnUiThread {
                    if (isDestroyed) return@runOnUiThread
                    selectedPlaylistIds.clear()
                    selectedPlaylistIds.addAll(playlistIds)
                    activePlaylistSignature = signature
                    songs = loadedSongs
                    currentIndex = songs.indexOfFirst { it.stableId == oldSongId }.takeIf { it >= 0 } ?: 0
                    statusLabel.text = "อัปเดตเพลย์ลิสต์แล้ว"
                    renderCurrentSong()
                    if (isPlaying) play()
                }
            } catch (_: Exception) {
                runOnUiThread { if (!isDestroyed) statusLabel.text = "ซิงก์เพลย์ลิสต์ไม่สำเร็จ" }
            }
        }
    }

    // ===================== API Helpers =====================

    private fun activePlaylistIds(tenantParam: String): List<Int> {
        val playlists = JSONArray(getJson("$baseUrl/api/playlists?tenant=$tenantParam"))
        if (playlists.length() == 0) error("ยังไม่มี playlist")
        val settings = JSONObject(getJson("$baseUrl/api/settings?tenant=$tenantParam"))
        val active = parseActivePlaylistIds(settings.opt("active_playlist_ids"))
        val enabledIds = mutableListOf<Int>()
        var defaultId = playlists.getJSONObject(0).getInt("id")
        for (i in 0 until playlists.length()) {
            val playlist = playlists.getJSONObject(i)
            val id = playlist.getInt("id")
            if (playlist.optBoolean("is_default", false)) defaultId = id
            if (playlist.optBoolean("is_enabled", true) && active.contains(id)) enabledIds.add(id)
        }
        return enabledIds.ifEmpty { listOf(defaultId) }
    }

    private fun parseActivePlaylistIds(value: Any?): Set<Int> {
        return when (value) {
            is JSONArray -> (0 until value.length()).mapNotNull { value.optInt(it).takeIf { id -> id > 0 } }.toSet()
            is String -> runCatching {
                val array = JSONArray(value)
                (0 until array.length()).mapNotNull { array.optInt(it).takeIf { id -> id > 0 } }.toSet()
            }.getOrDefault(emptySet())
            else -> emptySet()
        }
    }

    private fun loadSongsForPlaylists(tenantParam: String, playlistIds: List<Int>): List<NativeSong> {
        return playlistIds.flatMap { playlistId ->
            val songArray = JSONArray(getJson("$baseUrl/api/playlists/$playlistId/songs?tenant=$tenantParam"))
            (0 until songArray.length()).map { index ->
                val item = songArray.getJSONObject(index)
                NativeSong(
                    id = item.optInt("id", index),
                    playlistId = playlistId,
                    youtubeId = item.optString("youtube_id", ""),
                    title = item.optString("title", "Untitled"),
                    artist = item.optString("artist", "Music Bar").ifBlank { "Music Bar" },
                    thumbnail = item.optString("thumbnail", ""),
                    duration = item.optString("duration", ""),
                    audioUrl = firstNonBlank(
                        item.optString("audio_url", ""),
                        item.optString("stream_url", ""),
                        item.optString("media_url", ""),
                        item.optString("url", ""),
                    ),
                )
            }
        }
    }

    private fun firstNonBlank(vararg values: String): String {
        return values.firstOrNull { it.isNotBlank() && it != "null" } ?: ""
    }

    private fun showError(message: String) {
        runOnUiThread {
            if (isDestroyed) return@runOnUiThread
            statusLabel.text = message
            songTitle.text = "ไม่พร้อมเล่นเพลง"
            songArtist.text = "Music Bar"
            updatePlayPauseIcon()
        }
    }

    private fun getJson(urlString: String): String {
        val connection = (URL(urlString).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 10000
            readTimeout = 10000
            setRequestProperty("Accept", "application/json")
        }
        val stream = if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream
        return stream.bufferedReader().use { it.readText() }
    }

    // ===================== Rendering =====================

    private fun renderCurrentSong() {
        val song = songs.getOrNull(currentIndex) ?: return
        songTitle.text = song.title
        songArtist.text = song.artist
        durationMs = parseDuration(song.duration) * 1000
        updateProgress(positionMs = resumePositionMs.takeIf { it > 0 } ?: 0, durationMs = durationMs)
        renderQueue()
        loadArtwork(song.thumbnail)
        updatePlayPauseIcon()
        syncNotification()
        savePlaybackState()
    }

    private fun renderQueue() {
        queueList.removeAllViews()
        if (songs.size <= 1) return
        val maxItems = minOf(6, songs.size - 1)
        for (offset in 1..maxItems) {
            val song = songs[(currentIndex + offset) % songs.size]

            // Badge
            val badge = TextView(this).apply {
                text = "$offset"
                setTextColor(ContextCompat.getColor(this@MainActivity, R.color.musicbar_violet))
                textSize = 11f
                setTypeface(typeface, android.graphics.Typeface.BOLD)
                gravity = android.view.Gravity.CENTER
                layoutParams = LinearLayout.LayoutParams(dp(24), dp(24))
                background = GradientDrawable().apply {
                    val c = ContextCompat.getColor(this@MainActivity, R.color.musicbar_violet)
                    setColor(android.graphics.Color.argb(35, android.graphics.Color.red(c), android.graphics.Color.green(c), android.graphics.Color.blue(c)))
                    cornerRadius = dp(12).toFloat()
                }
            }

            val title = TextView(this).apply {
                text = song.title
                setTextColor(ContextCompat.getColor(this@MainActivity, R.color.cloud_white))
                textSize = 13f
                maxLines = 1
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                    marginStart = dp(12)
                }
            }

            val row = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = android.view.Gravity.CENTER_VERTICAL
                background = ContextCompat.getDrawable(this@MainActivity, R.drawable.bg_queue_row)
                setPadding(dp(14), dp(10), dp(14), dp(10))
                addView(badge)
                addView(title)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                ).apply { bottomMargin = dp(8) }
            }

            queueList.addView(row)
        }
    }

    // ===================== Artwork with LRU Cache =====================

    private fun loadArtwork(url: String) {
        if (url.isBlank()) {
            artworkView.setImageResource(R.drawable.ic_music_note)
            return
        }
        // Check cache first
        val cached = bitmapCache.get(url)
        if (cached != null) {
            artworkView.setImageBitmap(cached)
            return
        }
        pendingFuture = backgroundExecutor.submit {
            val bitmap = downloadBitmap(url)
            runOnUiThread {
                if (isDestroyed) return@runOnUiThread
                if (bitmap != null) {
                    bitmapCache.put(url, bitmap)
                    artworkView.setImageBitmap(bitmap)
                } else {
                    artworkView.setImageResource(R.drawable.ic_music_note)
                }
            }
        }
    }

    private fun loadBitmap(url: String, target: ImageView) {
        val cached = bitmapCache.get(url)
        if (cached != null) {
            target.setImageBitmap(cached)
            return
        }
        pendingFuture = backgroundExecutor.submit {
            val bitmap = downloadBitmap(url)
            runOnUiThread {
                if (isDestroyed) return@runOnUiThread
                if (bitmap != null) {
                    bitmapCache.put(url, bitmap)
                    target.setImageBitmap(bitmap)
                }
            }
        }
    }

    private fun downloadBitmap(urlString: String): Bitmap? {
        return try {
            val options = BitmapFactory.Options().apply {
                inSampleSize = 2 // Downscale to half resolution
            }
            URL(urlString).openStream().use { BitmapFactory.decodeStream(it, null, options) }
        } catch (_: Exception) {
            null
        }
    }

    // ===================== Playback =====================

    private fun play() {
        if (songs.isEmpty()) return

        // Find next song that has audio_url (auto-skip YT-only songs)
        val song = findNextPlayableSong(currentIndex)
        if (song == null) {
            isPlaying = false
            statusLabel.text = "ไม่มีเพลงที่มี audio_url ใน playlist นี้"
            updatePlayPauseIcon()
            syncNotification()
            savePlaybackState()
            return
        }

        isPlaying = true
        updatePlayPauseIcon()
        audioService?.acquirePlaybackLocks()
        prepareAndPlay(song, resumePositionMs)
        resumePositionMs = 0
    }

    private fun findNextPlayableSong(fromIndex: Int): NativeSong? {
        if (songs.isEmpty()) return null
        for (offset in 0 until songs.size) {
            val idx = (fromIndex + offset) % songs.size
            val s = songs[idx]
            if (s.audioUrl.isNotBlank()) {
                if (idx != currentIndex) currentIndex = idx
                return s
            }
        }
        return null
    }

    private fun prepareAndPlay(song: NativeSong, seekMs: Int) {
        isPreparing = true
        statusLabel.text = "Buffering native stream"
        releasePlayer()
        mediaPlayer = createPlayer(song.audioUrl).apply {
            setOnPreparedListener { player ->
                isPreparing = false
                durationMs = player.duration.takeIf { it > 0 } ?: durationMs
                if (seekMs > 0) player.seekTo(seekMs)
                player.start()
                statusLabel.text = "Playing native stream"
                updatePlayPauseIcon()
                syncNotification()
            }
            setOnCompletionListener {
                next(useCrossfade = false)
            }
            setOnErrorListener { _, what, extra ->
                isPreparing = false
                this@MainActivity.isPlaying = false
                statusLabel.text = "เล่น stream นี้ไม่สำเร็จ"
                updatePlayPauseIcon()
                audioService?.releasePlaybackLocks()
                true
            }
            prepareAsync()
        }
    }

    private fun createPlayer(url: String): MediaPlayer {
        return MediaPlayer().apply {
            setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build(),
            )
            setDataSource(url)
        }
    }

    private fun pause() {
        isPlaying = false
        if (mediaPlayer?.isPlaying == true) mediaPlayer?.pause()
        resumePositionMs = mediaPlayer?.currentPosition ?: resumePositionMs
        statusLabel.text = "Paused"
        updatePlayPauseIcon()
        syncNotification()
        savePlaybackState()
        audioService?.releasePlaybackLocks()
    }

    private fun next(useCrossfade: Boolean) {
        if (songs.isEmpty()) return
        // Find next song with audio_url (skip YT-only songs)
        for (offset in 1..songs.size) {
            val nextIndex = (currentIndex + offset) % songs.size
            val nextSong = songs[nextIndex]
            if (nextSong.audioUrl.isNotBlank()) {
                if (useCrossfade && isPlaying && mediaPlayer?.isPlaying == true) {
                    crossfadeTo(nextIndex, nextSong)
                } else {
                    currentIndex = nextIndex
                    resumePositionMs = 0
                    renderCurrentSong()
                    if (isPlaying) play()
                }
                return
            }
        }
        // No playable song found — stop
        statusLabel.text = "ไม่มีเพลงที่เล่นได้"
        isPlaying = false
        updatePlayPauseIcon()
        syncNotification()
        savePlaybackState()
    }

    private fun crossfadeTo(nextIndex: Int, nextSong: NativeSong) {
        statusLabel.text = "Crossfading"
        val fromPlayer = mediaPlayer ?: return
        val toPlayer = createPlayer(nextSong.audioUrl)
        fadingPlayer = toPlayer
        toPlayer.setVolume(0f, 0f)
        toPlayer.setOnPreparedListener {
            it.start()
            val startedAt = System.currentTimeMillis()
            val tick = object : Runnable {
                override fun run() {
                    val p = min(1f, (System.currentTimeMillis() - startedAt).toFloat() / crossfadeMs.toFloat())
                    fromPlayer.setVolume(1f - p, 1f - p)
                    toPlayer.setVolume(p, p)
                    if (p >= 1f) {
                        fromPlayer.stop()
                        fromPlayer.release()
                        mediaPlayer = toPlayer
                        fadingPlayer = null
                        currentIndex = nextIndex
                        resumePositionMs = 0
                        durationMs = toPlayer.duration.takeIf { d -> d > 0 } ?: parseDuration(nextSong.duration) * 1000
                        renderCurrentSong()
                        statusLabel.text = "Playing native stream"
                        savePlaybackState()
                    } else {
                        mainHandler.postDelayed(this, 100)
                    }
                }
            }
            mainHandler.post(tick)
        }
        toPlayer.setOnCompletionListener { next(useCrossfade = false) }
        toPlayer.prepareAsync()
    }

    private fun previous() {
        if (songs.isEmpty()) return
        // Find previous song with audio_url (skip YT-only songs)
        for (offset in 1..songs.size) {
            val prevIndex = ((currentIndex - offset) % songs.size + songs.size) % songs.size
            val prevSong = songs[prevIndex]
            if (prevSong.audioUrl.isNotBlank()) {
                currentIndex = prevIndex
                resumePositionMs = 0
                renderCurrentSong()
                if (isPlaying) play()
                return
            }
        }
        // No playable song found
        statusLabel.text = "ไม่มีเพลงที่เล่นได้"
        isPlaying = false
        updatePlayPauseIcon()
        syncNotification()
        savePlaybackState()
    }

    // ===================== Native Actions =====================

    override fun onNativeMediaAction(action: String) {
        runOnUiThread {
            if (isDestroyed) return@runOnUiThread
            when (action) {
                "play" -> play()
                "pause" -> pause()
                "next", "crossfade" -> next(useCrossfade = action == "crossfade")
                "previous" -> previous()
            }
        }
    }

    // ===================== UI Helpers =====================

    private fun updatePlayPauseIcon() {
        playPauseButton.setImageResource(if (isPlaying) R.drawable.ic_pause else R.drawable.ic_play)
        playPauseButton.contentDescription = if (isPlaying) "Pause" else "Play"
    }

    private fun updateProgressFromPlayer() {
        val player = mediaPlayer
        val position = if (player != null && !isPreparing) player.currentPosition else resumePositionMs
        val duration = player?.duration?.takeIf { it > 0 } ?: durationMs
        updateProgress(position, duration)
        syncNotification()
    }

    private fun updateProgress(positionMs: Int, durationMs: Int) {
        currentTimeLabel.text = formatTime(positionMs / 1000)
        durationLabel.text = formatTime(durationMs / 1000)
        val safeDuration = max(1, durationMs)
        progress.progress = ((positionMs.coerceAtMost(safeDuration) * 1000L) / safeDuration).toInt()
    }

    private fun syncNotification() {
        val song = songs.getOrNull(currentIndex) ?: return
        val player = mediaPlayer
        val position = player?.currentPosition ?: resumePositionMs
        val duration = player?.duration?.takeIf { it > 0 } ?: durationMs
        if (isBound) {
            audioService?.configureNativePlayback(queueJson(), crossfadeMs)
            audioService?.updatePlaybackState(
                isPlaying,
                song.title,
                song.artist,
                song.thumbnail,
                (position / 1000).toLong(),
                (duration / 1000).toLong(),
            )
        }
    }

    private fun savePlaybackState() {
        val song = songs.getOrNull(currentIndex) ?: return
        val position = mediaPlayer?.currentPosition ?: resumePositionMs
        prefs.edit()
            .putString(KEY_TENANT, tenantSlug)
            .putString(KEY_PLAYLISTS, activePlaylistSignature)
            .putString(KEY_SONG_ID, song.stableId)
            .putInt(KEY_INDEX, currentIndex)
            .putInt(KEY_POSITION_MS, position)
            .putBoolean(KEY_WAS_PLAYING, isPlaying)
            .apply()
    }

    private fun queueJson(): String {
        val array = JSONArray()
        songs.take(12).forEach { song ->
            array.put(
                JSONObject()
                    .put("youtube_id", song.youtubeId)
                    .put("title", song.title)
                    .put("artist", song.artist)
                    .put("thumbnail", song.thumbnail)
                    .put("audio_url", song.audioUrl),
            )
        }
        return array.toString()
    }

    // ===================== Helpers =====================

    private fun parseDuration(value: String): Int {
        if (value.isBlank()) return 0
        val parts = value.split(":").mapNotNull { it.toIntOrNull() }
        return when (parts.size) {
            3 -> parts[0] * 3600 + parts[1] * 60 + parts[2]
            2 -> parts[0] * 60 + parts[1]
            1 -> parts[0]
            else -> 0
        }
    }

    private fun formatTime(seconds: Int): String {
        val safe = seconds.coerceAtLeast(0)
        return "${safe / 60}:${(safe % 60).toString().padStart(2, '0')}"
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

    private fun releasePlayer() {
        mediaPlayer?.release()
        mediaPlayer = null
        fadingPlayer?.release()
        fadingPlayer = null
    }

    private fun enableFullscreenMode() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }

    // ===================== Service =====================

    private fun startAudioService() {
        val serviceIntent = Intent(this, BackgroundAudioService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
    }

    private fun bindAudioService() {
        bindService(Intent(this, BackgroundAudioService::class.java), serviceConnection, Context.BIND_AUTO_CREATE)
    }

    private fun requestRuntimePermissions() {
        val permissions = mutableListOf<String>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        if (permissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toTypedArray(), 101)
        }
    }

    private fun registerStopReceiver() {
        val filter = IntentFilter(BackgroundAudioService.ACTION_STOP_ACTIVITY)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(stopReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(stopReceiver, filter)
        }
    }

    companion object {
        private const val KEY_TENANT = "tenant"
        private const val KEY_PLAYLISTS = "playlist_ids"
        private const val KEY_SONG_ID = "song_id"
        private const val KEY_INDEX = "index"
        private const val KEY_POSITION_MS = "position_ms"
        private const val KEY_WAS_PLAYING = "was_playing"
    }
}

data class NativeSong(
    val id: Int,
    val playlistId: Int,
    val youtubeId: String,
    val title: String,
    val artist: String,
    val thumbnail: String,
    val duration: String,
    val audioUrl: String,
) {
    val stableId: String = "$playlistId:$id:$youtubeId"
}

data class NativeStation(
    val id: String,
    val slug: String,
    val name: String,
    val displayName: String,
    val logoUrl: String,
    val coverThumbnail: String,
    val playlistCount: Int,
    val songCount: Int,
)
