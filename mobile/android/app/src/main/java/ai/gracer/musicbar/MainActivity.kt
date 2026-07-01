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
import android.net.Uri
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
import android.widget.Button
import android.widget.Toast
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
import java.io.File
import java.util.concurrent.Executors
import java.util.concurrent.Future
import kotlin.math.max
import kotlin.math.min

class MainActivity : AppCompatActivity(), BackgroundAudioService.NativeActionHandler {

    // ---- Views ----
    private lateinit var artworkFrame: FrameLayout
    private lateinit var stationSelectView: ScrollView
    private lateinit var playerView: LinearLayout
    private lateinit var stationContent: LinearLayout
    private lateinit var playerContent: LinearLayout
    private lateinit var stationList: LinearLayout
    private lateinit var stationLabel: TextView
    private lateinit var statusLabel: TextView
    private lateinit var artworkView: ImageView
    private lateinit var controlArtworkView: ImageView
    private lateinit var songTitle: TextView
    private lateinit var songArtist: TextView
    private lateinit var progress: ProgressBar
    private lateinit var currentTimeLabel: TextView
    private lateinit var durationLabel: TextView
    private lateinit var backButton: ImageButton
    private lateinit var playPauseButton: ImageButton
    private lateinit var previousButton: ImageButton
    private lateinit var nextButton: ImageButton
    private lateinit var crossfadeToggle: ImageButton
    private lateinit var controlBar: LinearLayout
    private lateinit var queueList: LinearLayout
    private lateinit var crossfadeLabel: TextView
    private lateinit var loadingSpinner: ProgressBar
    private lateinit var playlistSelectButton: ImageButton
    private lateinit var playlistSelectView: LinearLayout
    private lateinit var playlistList: LinearLayout
    private lateinit var cancelPlaylistSelectButton: ImageButton


    // ---- State ----
    private var audioService: BackgroundAudioService? = null
    private var isBound = false
    private var mediaPlayer: MediaPlayer? = null
    private var fadingPlayer: MediaPlayer? = null
    private var songs: List<NativeSong> = emptyList()
    private var currentIndex = 0
    private var isPlaying = false
    private var isPreparing = false
    private var crossfadeEnabled = true
    private var playbackGeneration = 0
    private var preparedSongId = ""
    private var playbackStartedAtMs = 0L
    private var playbackBasePositionMs = 0
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
    private val audioExecutor = Executors.newSingleThreadExecutor()
    private var pendingFuture: Future<*>? = null
    private var audioFuture: Future<*>? = null
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
            controlBar.visibility = View.GONE
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
        audioFuture?.cancel(true)
        backgroundExecutor.shutdownNow()
        audioExecutor.shutdownNow()
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
        controlArtworkView = findViewById(R.id.controlArtworkView)
        songTitle = findViewById(R.id.songTitle)
        songArtist = findViewById(R.id.songArtist)
        progress = findViewById(R.id.playbackProgress)
        currentTimeLabel = findViewById(R.id.currentTimeLabel)
        durationLabel = findViewById(R.id.durationLabel)
        backButton = findViewById(R.id.backButton)
        playPauseButton = findViewById(R.id.playPauseButton)
        previousButton = findViewById(R.id.previousButton)
        nextButton = findViewById(R.id.nextButton)
        crossfadeToggle = findViewById(R.id.crossfadeToggle)
        controlBar = findViewById(R.id.controlBar)
        queueList = findViewById(R.id.queueList)
        crossfadeLabel = findViewById(R.id.crossfadeLabel)
        loadingSpinner = findViewById(R.id.loadingSpinner)
        playlistSelectButton = findViewById(R.id.playlistSelectButton)
        playlistSelectView = findViewById(R.id.playlistSelectView)
        playlistList = findViewById(R.id.playlistList)
        cancelPlaylistSelectButton = findViewById(R.id.cancelPlaylistSelectButton)
        applyRoundedCorners(controlArtworkView, 4)
    }

    private fun applyRoundedCorners(imageView: ImageView, radiusDp: Int) {
        imageView.clipToOutline = true
        imageView.outlineProvider = object : android.view.ViewOutlineProvider() {
            override fun getOutline(view: View, outline: android.graphics.Outline) {
                outline.setRoundRect(0, 0, view.width, view.height, dp(radiusDp).toFloat())
            }
        }
    }

    private fun makeResponsive() {
        val width = resources.displayMetrics.widthPixels
        val density = resources.displayMetrics.density
        val maxContentPx = (680 * density).toInt()
        val contentWidth = min(width - (48 * density).toInt(), maxContentPx).coerceAtLeast((280 * density).toInt())
        stationContent.layoutParams = stationContent.layoutParams.apply { this.width = contentWidth }
        playlistList.layoutParams = playlistList.layoutParams.apply { this.width = contentWidth }
        playerContent.layoutParams = playerContent.layoutParams.apply { this.width = LinearLayout.LayoutParams.MATCH_PARENT }

        artworkFrame.visibility = View.GONE
    }

    // ===================== Controls =====================

    private fun setupNativeControls() {
        backButton.setOnClickListener {
            playerView.visibility = View.GONE
            controlBar.visibility = View.GONE
            stationSelectView.visibility = View.VISIBLE
        }
        playPauseButton.setOnClickListener {
            if (isPlaying) pause() else play()
        }
        playlistSelectButton.setOnClickListener {
            showPlaylistSelectionScreen()
        }
        cancelPlaylistSelectButton.setOnClickListener {
            playlistSelectView.visibility = View.GONE
            playerView.visibility = View.VISIBLE
            controlBar.visibility = View.VISIBLE
        }
        nextButton.setOnClickListener { next(useCrossfade = crossfadeEnabled) }
        previousButton.setOnClickListener { previous() }
        crossfadeToggle.setOnClickListener {
            crossfadeEnabled = !crossfadeEnabled
            updateCrossfadeToggle()
        }
        updateCrossfadeToggle()
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
                    loadBitmap(station.coverThumbnail, this, null)
                }
            }

            // --- Station name ---
            val title = TextView(this).apply {
                text = station.displayName
                setTextColor(ContextCompat.getColor(this@MainActivity, R.color.cloud_white))
                textSize = 18f
                setTypeface(typeface, android.graphics.Typeface.BOLD)
                maxLines = 1
                gravity = android.view.Gravity.START
            }

            // --- Meta info ---
            val meta = TextView(this).apply {
                val resumeHint = if (station.slug == savedTenant) " • เล่นต่อจากครั้งล่าสุด" else ""
                text = "${station.songCount} songs  |  ${station.playlistCount} playlists$resumeHint"
                setTextColor(ContextCompat.getColor(this@MainActivity, R.color.slate_300))
                textSize = 12f
                maxLines = 1
            }

            val cue = TextView(this).apply {
                text = "OPEN"
                setTextColor(ContextCompat.getColor(this@MainActivity, R.color.cloud_white))
                textSize = 10f
                setTypeface(typeface, android.graphics.Typeface.BOLD)
                letterSpacing = 0.18f
                gravity = android.view.Gravity.CENTER
                background = ContextCompat.getDrawable(this@MainActivity, R.drawable.bg_station_action)
                setPadding(dp(12), dp(7), dp(12), dp(7))
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
                addView(cue)
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
        controlBar.visibility = View.VISIBLE
        releasePlayer()
        isPlaying = false
        isPreparing = false
        playbackStartedAtMs = 0L
        playbackBasePositionMs = 0
        tenantSlug = station.slug
        stationLabel.text = station.displayName
        statusLabel.text = "กำลังโหลด"
        songTitle.text = "กำลังโหลดเพลง..."
        songArtist.text = station.displayName
        artworkView.setImageResource(R.drawable.ic_music_note)
        controlArtworkView.setImageResource(R.drawable.ic_music_note)
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
                    val targetIndex = songs.indexOfFirst { it.stableId == restoredSongId }.takeIf { it >= 0 } ?: 0
                    resumePositionMs = restoredPosition
                    if (songs.isEmpty()) {
                        showError("active playlist ยังไม่มีเพลง")
                    } else {
                        val playableIdx = findPlayableIndex(targetIndex, true, true)
                        if (playableIdx == -1) {
                            showError("ไม่มีเพลงที่เล่นได้ในสถานีนี้")
                        } else {
                            currentIndex = playableIdx
                            renderCurrentSong()
                            play()
                        }
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
                    statusLabel.text = "อัปเดตแล้ว"
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
        val executor = java.util.concurrent.Executors.newFixedThreadPool(2)
        val playlistsFuture = executor.submit<String> {
            getJson("$baseUrl/api/playlists?tenant=$tenantParam")
        }
        val settingsFuture = executor.submit<String> {
            getJson("$baseUrl/api/settings?tenant=$tenantParam")
        }
        val playlists = JSONArray(playlistsFuture.get())
        if (playlists.length() == 0) {
            executor.shutdown()
            error("ยังไม่มี playlist")
        }
        val settings = JSONObject(settingsFuture.get())
        executor.shutdown()
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
        if (playlistIds.isEmpty()) return emptyList()
        val executor = java.util.concurrent.Executors.newFixedThreadPool(playlistIds.size.coerceAtMost(4))
        val futures = playlistIds.map { playlistId ->
            executor.submit<List<NativeSong>> {
                try {
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
                            audioUrl = absoluteUrl(firstNonBlank(
                                if (item.isNull("audio_url")) "" else item.optString("audio_url", ""),
                                if (item.isNull("stream_url")) "" else item.optString("stream_url", ""),
                                if (item.isNull("media_url")) "" else item.optString("media_url", ""),
                                if (item.isNull("url")) "" else item.optString("url", ""),
                            )),
                        )
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                    emptyList()
                }
            }
        }
        val mergedList = mutableListOf<NativeSong>()
        for (f in futures) {
            mergedList.addAll(f.get())
        }
        executor.shutdown()
        return mergedList
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
            connectTimeout = 30000
            readTimeout = 30000
            setRequestProperty("Accept", "application/json")
        }
        val stream = if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream
        return stream.bufferedReader().use { it.readText() }
    }

    // ===================== Rendering =====================

    private fun renderCurrentSong() {
        val song = songs.getOrNull(currentIndex) ?: return
        songTitle.text = song.title
        songTitle.isSelected = true
        songArtist.text = song.artist
        durationMs = parseDuration(song.duration) * 1000
        updateProgress(positionMs = resumePositionMs.takeIf { it > 0 } ?: 0, durationMs = durationMs)
        renderQueue()
        loadArtwork(song.thumbnail)
        if (!isPlaying && !isPreparing) statusLabel.text = "พร้อมเล่น"
        updatePlayPauseIcon()
        syncNotification()
        savePlaybackState()
    }

    private fun renderQueue() {
        queueList.removeAllViews()
        if (songs.isEmpty()) return

        val isTablet = resources.configuration.smallestScreenWidthDp >= 600
        if (isTablet) {
            val colCount = 4
            var currentRow: LinearLayout? = null
            for (idx in songs.indices) {
                val song = songs[idx]
                val isCurrent = idx == currentIndex

                if (idx % colCount == 0) {
                    currentRow = LinearLayout(this).apply {
                        orientation = LinearLayout.HORIZONTAL
                        layoutParams = LinearLayout.LayoutParams(
                            LinearLayout.LayoutParams.MATCH_PARENT,
                            LinearLayout.LayoutParams.WRAP_CONTENT
                        ).apply {
                            bottomMargin = dp(12)
                        }
                    }
                    queueList.addView(currentRow)
                }

                val card = buildSongCard(song, idx, isCurrent)
                currentRow?.addView(card)
            }

            // Fill remainder of the last row
            val remainder = songs.size % colCount
            if (remainder > 0 && currentRow != null) {
                for (i in 0 until (colCount - remainder)) {
                    val spacer = View(this).apply {
                        layoutParams = LinearLayout.LayoutParams(0, 1, 1f).apply {
                            marginEnd = dp(6)
                            marginStart = dp(6)
                        }
                    }
                    currentRow.addView(spacer)
                }
            }
        } else {
            // Mobile: vertical list of rows
            for (idx in songs.indices) {
                val song = songs[idx]
                val isCurrent = idx == currentIndex
                val row = buildSongRow(song, idx, isCurrent)
                queueList.addView(row)
            }
        }
    }

    private fun buildSongCard(song: NativeSong, idx: Int, isCurrent: Boolean): View {
        val hasAudio = song.audioUrl.isNotBlank() && absoluteUrl(song.audioUrl).isNotBlank()

        val cover = ImageView(this).apply {
            layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(110)).apply {
                bottomMargin = dp(8)
            }
            background = ContextCompat.getDrawable(this@MainActivity, R.drawable.bg_control_artwork)
            scaleType = ImageView.ScaleType.CENTER_CROP
            setPadding(dp(2), dp(2), dp(2), dp(2))
            setImageResource(R.drawable.ic_music_note)
            applyRoundedCorners(this, 4)
            if (song.thumbnail.isNotBlank()) loadBitmap(song.thumbnail, this, null)
        }

        val title = TextView(this).apply {
            text = song.title
            setTextColor(
                if (isCurrent) ContextCompat.getColor(this@MainActivity, R.color.white)
                else ContextCompat.getColor(this@MainActivity, R.color.cloud_white)
            )
            textSize = 13f
            setTypeface(typeface, if (isCurrent) android.graphics.Typeface.BOLD_ITALIC else android.graphics.Typeface.BOLD)
            maxLines = 2
            ellipsize = android.text.TextUtils.TruncateAt.END
        }

        val artist = TextView(this).apply {
            text = song.artist
            setTextColor(
                if (isCurrent) android.graphics.Color.parseColor("#D7D5FF")
                else ContextCompat.getColor(this@MainActivity, R.color.slate_300)
            )
            textSize = 11f
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
        }

        val cardContent = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(8), dp(8), dp(8), dp(8))
            addView(cover)
            addView(title)
            addView(artist.apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = dp(2) }
            })
        }

        return LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            background = ContextCompat.getDrawable(
                this@MainActivity,
                if (isCurrent) R.drawable.bg_playlist_card_active
                else R.drawable.bg_playlist_card
            )
            addView(cardContent.apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
            })
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                marginEnd = dp(6)
                marginStart = dp(6)
            }
            if (hasAudio) {
                setOnClickListener {
                    if (currentIndex != idx) {
                        currentIndex = idx
                        resumePositionMs = 0
                        renderCurrentSong()
                        startSong(song, 0)
                    } else {
                        if (isPlaying) pause() else play()
                    }
                }
            } else {
                alpha = 0.4f
            }
        }
    }

    private fun buildSongRow(song: NativeSong, idx: Int, isCurrent: Boolean): View {
        val hasAudio = song.audioUrl.isNotBlank() && absoluteUrl(song.audioUrl).isNotBlank()

        val cover = ImageView(this).apply {
            layoutParams = LinearLayout.LayoutParams(dp(48), dp(48))
            background = ContextCompat.getDrawable(this@MainActivity, R.drawable.bg_control_artwork)
            scaleType = ImageView.ScaleType.CENTER_CROP
            setPadding(dp(2), dp(2), dp(2), dp(2))
            setImageResource(R.drawable.ic_music_note)
            applyRoundedCorners(this, 4)
            if (song.thumbnail.isNotBlank()) loadBitmap(song.thumbnail, this, null)
        }

        val title = TextView(this).apply {
            text = song.title
            setTextColor(
                if (isCurrent) ContextCompat.getColor(this@MainActivity, R.color.white)
                else ContextCompat.getColor(this@MainActivity, R.color.cloud_white)
            )
            textSize = 14f
            setTypeface(typeface, if (isCurrent) android.graphics.Typeface.BOLD_ITALIC else android.graphics.Typeface.BOLD)
            maxLines = 1
        }

        val artist = TextView(this).apply {
            text = song.artist
            setTextColor(
                if (isCurrent) android.graphics.Color.parseColor("#D7D5FF")
                else ContextCompat.getColor(this@MainActivity, R.color.slate_300)
            )
            textSize = 12f
            maxLines = 1
        }

        val textColumn = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                marginStart = dp(12)
            }
            addView(title)
            addView(artist.apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                ).apply { topMargin = dp(3) }
            })
        }

        return LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
            background = if (isCurrent) {
                ContextCompat.getDrawable(this@MainActivity, R.drawable.bg_playlist_card_active)
            } else {
                null
            }
            setPadding(dp(12), dp(10), dp(12), dp(10))
            addView(cover)
            addView(textColumn)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT,
            ).apply { bottomMargin = dp(8) }
            if (hasAudio) {
                setOnClickListener {
                    if (currentIndex != idx) {
                        currentIndex = idx
                        resumePositionMs = 0
                        renderCurrentSong()
                        startSong(song, 0)
                    } else {
                        if (isPlaying) pause() else play()
                    }
                }
            } else {
                alpha = 0.4f
            }
        }
    }

    private fun showPlaylistSelectionScreen() {
        playerView.visibility = View.GONE
        controlBar.visibility = View.GONE
        playlistSelectView.visibility = View.VISIBLE
        playlistList.removeAllViews()

        val loadingText = TextView(this).apply {
            text = "กำลังโหลด..."
            setTextColor(android.graphics.Color.WHITE)
            textSize = 16f
            gravity = android.view.Gravity.CENTER
            setPadding(dp(16), dp(16), dp(16), dp(16))
        }
        playlistList.addView(loadingText)

        backgroundExecutor.submit {
            try {
                val tenantParam = URLEncoder.encode(tenantSlug, "UTF-8")
                val json = getJson("$baseUrl/api/playlists?tenant=$tenantParam")
                val array = JSONArray(json)
                
                data class PlaylistInfo(val name: String, val id: Int, val coverUrl: String, val songCount: Int)
                val playlists = mutableListOf<PlaylistInfo>()
                for (i in 0 until array.length()) {
                    val pl = array.getJSONObject(i)
                    if (pl.optBoolean("is_enabled", true)) {
                        playlists.add(PlaylistInfo(
                            name = pl.getString("name"),
                            id = pl.getInt("id"),
                            coverUrl = pl.optString("cover_thumbnail", ""),
                            songCount = pl.optInt("song_count", 0)
                        ))
                    }
                }
                
                runOnUiThread {
                    if (isDestroyed) return@runOnUiThread
                    playlistList.removeAllViews()
                    if (playlists.isEmpty()) {
                        val emptyText = TextView(this).apply {
                            text = "ไม่มี Playlist"
                            setTextColor(android.graphics.Color.WHITE)
                            textSize = 16f
                            gravity = android.view.Gravity.CENTER
                            setPadding(dp(16), dp(16), dp(16), dp(16))
                        }
                        playlistList.addView(emptyText)
                    } else {
                        val isTablet = resources.configuration.smallestScreenWidthDp >= 600
                        if (isTablet) {
                            val colCount = 4
                            var currentRow: LinearLayout? = null
                            for (idx in playlists.indices) {
                                if (idx % colCount == 0) {
                                    currentRow = LinearLayout(this).apply {
                                        orientation = LinearLayout.HORIZONTAL
                                        layoutParams = LinearLayout.LayoutParams(
                                            LinearLayout.LayoutParams.MATCH_PARENT,
                                            LinearLayout.LayoutParams.WRAP_CONTENT
                                        ).apply {
                                            bottomMargin = dp(16)
                                        }
                                    }
                                    playlistList.addView(currentRow)
                                }
                                val card = buildPlaylistCard(
                                    playlists[idx].name,
                                    playlists[idx].id,
                                    playlists[idx].coverUrl,
                                    playlists[idx].songCount
                                )
                                currentRow?.addView(card)
                            }
                            
                            // Fill remainder of the last row
                            val remainder = playlists.size % colCount
                            if (remainder > 0 && currentRow != null) {
                                for (i in 0 until (colCount - remainder)) {
                                    val dummy = View(this).apply {
                                        layoutParams = LinearLayout.LayoutParams(0, 1, 1f).apply {
                                            marginEnd = dp(8)
                                            marginStart = dp(8)
                                        }
                                    }
                                    currentRow.addView(dummy)
                                }
                            }
                        } else {
                            for (pl in playlists) {
                                val card = buildPlaylistCard(pl.name, pl.id, pl.coverUrl, pl.songCount)
                                playlistList.addView(card)
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    if (isDestroyed) return@runOnUiThread
                    playlistList.removeAllViews()
                    val errorText = TextView(this).apply {
                        text = "โหลด Playlist ไม่สำเร็จ"
                        setTextColor(android.graphics.Color.RED)
                        textSize = 16f
                        gravity = android.view.Gravity.CENTER
                        setPadding(dp(16), dp(16), dp(16), dp(16))
                    }
                    playlistList.addView(errorText)
                }
            }
        }
    }

    private fun buildPlaylistCard(name: String, playlistId: Int, coverUrl: String, songCount: Int): View {
        val isTablet = resources.configuration.smallestScreenWidthDp >= 600
        val isActive = selectedPlaylistIds.contains(playlistId)

        val title = TextView(this).apply {
            text = name
            setTextColor(
                if (isActive) ContextCompat.getColor(this@MainActivity, R.color.white)
                else ContextCompat.getColor(this@MainActivity, R.color.cloud_white)
            )
            textSize = 14f
            setTypeface(typeface, if (isActive) android.graphics.Typeface.BOLD_ITALIC else android.graphics.Typeface.BOLD)
            maxLines = 2
            ellipsize = android.text.TextUtils.TruncateAt.END
        }

        val subtitle = TextView(this).apply {
            text = "$songCount เพลง"
            setTextColor(
                if (isActive) android.graphics.Color.parseColor("#D7D5FF")
                else ContextCompat.getColor(this@MainActivity, R.color.slate_300)
            )
            textSize = 12f
            maxLines = 1
        }

        val cover = ImageView(this).apply {
            layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(110)).apply {
                bottomMargin = dp(8)
            }
            background = ContextCompat.getDrawable(this@MainActivity, R.drawable.bg_control_artwork)
            applyRoundedCorners(this, 4)
            if (coverUrl.isNotBlank()) {
                scaleType = ImageView.ScaleType.CENTER_CROP
                setPadding(0, 0, 0, 0)
                loadBitmap(coverUrl, this, null)
            } else {
                scaleType = ImageView.ScaleType.CENTER_INSIDE
                setPadding(dp(24), dp(24), dp(24), dp(24))
                setImageResource(R.drawable.ic_playlist)
                setColorFilter(ContextCompat.getColor(this@MainActivity, R.color.white))
            }
        }

        val cardContent = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(8), dp(8), dp(8), dp(8))
            addView(cover)
            addView(title)
            addView(subtitle.apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = dp(2) }
            })
        }

        return LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            background = ContextCompat.getDrawable(
                this@MainActivity,
                if (isActive) R.drawable.bg_playlist_card_active
                else R.drawable.bg_playlist_card
            )
            addView(cardContent.apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
            })

            layoutParams = if (isTablet) {
                LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                    marginEnd = dp(6)
                    marginStart = dp(6)
                }
            } else {
                LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    bottomMargin = dp(12)
                }
            }

            setOnClickListener {
                playlistSelectView.visibility = View.GONE
                playerView.visibility = View.VISIBLE
                controlBar.visibility = View.VISIBLE
                loadPlaylistSongs(playlistId)
            }
        }
    }

    private fun loadPlaylistSongs(playlistId: Int) {
        setLoadingState(true)
        backgroundExecutor.submit {
            try {
                val tenantParam = URLEncoder.encode(tenantSlug, "UTF-8")
                val loadedSongs = loadSongsForPlaylists(tenantParam, listOf(playlistId))
                runOnUiThread {
                    if (isDestroyed) return@runOnUiThread
                    selectedPlaylistIds.clear()
                    selectedPlaylistIds.add(playlistId)
                    activePlaylistSignature = playlistId.toString()
                    songs = loadedSongs
                    resumePositionMs = 0

                    val playableIdx = findPlayableIndex(0, true, true)
                    if (playableIdx == -1) {
                        showError("ไม่มีเพลงที่เล่นได้ใน playlist นี้")
                    } else {
                        currentIndex = playableIdx
                        renderCurrentSong()
                        play()
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    if (!isDestroyed) {
                        setLoadingState(false, "โหลดเพลงล้มเหลว")
                    }
                }
            }
        }
    }

    // ===================== Artwork with LRU Cache =====================

    private fun loadArtwork(url: String) {
        val imageUrl = absoluteUrl(url)
        if (imageUrl.isBlank()) {
            artworkView.setImageResource(R.drawable.ic_music_note)
            controlArtworkView.setImageResource(R.drawable.ic_music_note)
            return
        }
        // Check cache first
        val cached = bitmapCache.get(imageUrl)
        if (cached != null) {
            artworkView.setImageBitmap(cached)
            controlArtworkView.setImageBitmap(cached)
            return
        }
        pendingFuture = backgroundExecutor.submit {
            val bitmap = downloadBitmap(imageUrl)
            runOnUiThread {
                if (isDestroyed) return@runOnUiThread
                if (bitmap != null) {
                    bitmapCache.put(imageUrl, bitmap)
                    artworkView.setImageBitmap(bitmap)
                    controlArtworkView.setImageBitmap(bitmap)
                } else {
                    artworkView.setImageResource(R.drawable.ic_music_note)
                    controlArtworkView.setImageResource(R.drawable.ic_music_note)
                }
            }
        }
    }

    private fun loadBitmap(url: String, target: ImageView, mirrorTarget: ImageView? = null) {
        val imageUrl = absoluteUrl(url)
        val cached = bitmapCache.get(imageUrl)
        if (cached != null) {
            target.setImageBitmap(cached)
            mirrorTarget?.setImageBitmap(cached)
            return
        }
        pendingFuture = backgroundExecutor.submit {
            val bitmap = downloadBitmap(imageUrl)
            runOnUiThread {
                if (isDestroyed) return@runOnUiThread
                if (bitmap != null) {
                    bitmapCache.put(imageUrl, bitmap)
                    target.setImageBitmap(bitmap)
                    mirrorTarget?.setImageBitmap(bitmap)
                }
            }
        }
    }

    private fun downloadBitmap(urlString: String): Bitmap? {
        return try {
            val options = BitmapFactory.Options().apply {
                inSampleSize = 2 // Downscale to half resolution
            }
            val connection = (URL(urlString).openConnection() as HttpURLConnection).apply {
                connectTimeout = 8000
                readTimeout = 15000
            }
            connection.inputStream.use { BitmapFactory.decodeStream(it, null, options) }
        } catch (_: Exception) {
            null
        }
    }

    // ===================== Playback =====================

    private fun play() {
        if (songs.isEmpty()) return

        val playableIndex = findPlayableIndex(currentIndex, forward = true, includeCurrent = true)
        if (playableIndex == -1) {
            isPlaying = false
            statusLabel.text = "ไม่มีเพลงที่มี audio_url ใน playlist นี้"
            updatePlayPauseIcon()
            syncNotification()
            savePlaybackState()
            return
        }

        if (playableIndex != currentIndex) {
            currentIndex = playableIndex
            resumePositionMs = 0
            renderCurrentSong()
        }

        val song = songs[currentIndex]
        val player = mediaPlayer
        if (!isPreparing && player != null && preparedSongId == song.stableId) {
            runCatching { player.start() }
                .onSuccess {
                    isPlaying = true
                    playbackBasePositionMs = resumePositionMs
                    playbackStartedAtMs = System.currentTimeMillis()
                    statusLabel.text = "กำลังเล่น"
                    updatePlayPauseIcon()
                    syncNotification()
                    savePlaybackState()
                    audioService?.acquirePlaybackLocks()
                }
                .onFailure { startSong(song, resumePositionMs) }
            return
        }

        startSong(song, resumePositionMs)
    }

    private fun findPlayableIndex(fromIndex: Int, forward: Boolean, includeCurrent: Boolean): Int {
        if (songs.isEmpty()) return -1
        val firstOffset = if (includeCurrent) 0 else 1
        for (offset in firstOffset until songs.size + firstOffset) {
            val step = if (forward) offset else -offset
            val idx = ((fromIndex + step) % songs.size + songs.size) % songs.size
            if (songs[idx].audioUrl.isNotBlank()) return idx
        }
        return -1
    }

    private fun setLoadingState(isLoading: Boolean, statusText: String? = null) {
        runOnUiThread {
            if (isLoading) {
                loadingSpinner.visibility = View.VISIBLE
                statusLabel.visibility = View.GONE
            } else {
                loadingSpinner.visibility = View.GONE
                statusLabel.visibility = View.VISIBLE
                if (statusText != null) {
                    statusLabel.text = statusText
                }
            }
        }
    }

    private fun getFreshSongUrl(song: NativeSong): String {
        val safeName = song.stableId.replace(Regex("[^A-Za-z0-9._-]"), "_")
        val cachedFile = File(cacheDir, "musicbar_$safeName.mp3")
        if (cachedFile.exists() && cachedFile.length() > 1024 * 128) {
            return cachedFile.absolutePath
        }
        return song.audioUrl
    }

    private fun startSong(song: NativeSong, seekMs: Int) {
        android.util.Log.d("MusicBarPlayer", "startSong: title=${song.title}, audioUrl=${song.audioUrl}")
        val generation = ++playbackGeneration
        isPlaying = true
        isPreparing = true
        setLoadingState(true)
        updatePlayPauseIcon()
        syncNotification()
        savePlaybackState()
        audioService?.acquirePlaybackLocks()
        releasePlayer()

        // Always download to cache first, then play from local file
        // CDN doesn't support Range requests, so MediaPlayer can't stream directly
        prepareCachedAndPlay(song, seekMs, generation)
    }

    private fun createPlayer(url: String): MediaPlayer {
        val clean = url.trim()
        val localFile = File(clean)
        val source = if (localFile.isAbsolute && localFile.exists()) clean else absoluteUrl(clean)
        android.util.Log.d("MusicBarPlayer", "createPlayer source=$source")
        return MediaPlayer().apply {
            setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build(),
            )
            if (localFile.isAbsolute && localFile.exists()) {
                android.util.Log.d("MusicBarPlayer", "setDataSource from local file: $clean")
                setDataSource(this@MainActivity, Uri.fromFile(localFile))
            } else if (source.startsWith("http://") || source.startsWith("https://")) {
                android.util.Log.d("MusicBarPlayer", "setDataSource from URI: $source")
                setDataSource(this@MainActivity, Uri.parse(source))
            } else {
                android.util.Log.d("MusicBarPlayer", "setDataSource from raw string: $source")
                setDataSource(source)
            }
        }
    }

    private fun prepareCachedAndPlay(song: NativeSong, seekMs: Int, generation: Int) {
        audioFuture?.cancel(true)
        audioFuture = audioExecutor.submit {
            val file = downloadAudioToCache(song)
            runOnUiThread {
                if (isDestroyed || generation != playbackGeneration) return@runOnUiThread
                if (file == null) {
                    isPreparing = false
                    isPlaying = false
                    statusLabel.text = "โหลดเพลงไม่สำเร็จ"
                    updatePlayPauseIcon()
                    syncNotification()
                    savePlaybackState()
                    audioService?.releasePlaybackLocks()
                    return@runOnUiThread
                }
                mediaPlayer = try {
                    createPlayer(file.absolutePath)
                } catch (e: Exception) {
                    e.printStackTrace()
                    null
                }
                val cachedPlayer = mediaPlayer
                if (cachedPlayer == null) {
                    isPreparing = false
                    isPlaying = false
                    statusLabel.text = "เปิดไฟล์เพลงไม่สำเร็จ"
                    updatePlayPauseIcon()
                    return@runOnUiThread
                }
                cachedPlayer.apply {
                    setOnPreparedListener { player ->
                        if (generation != playbackGeneration) {
                            runCatching { player.release() }
                            return@setOnPreparedListener
                        }
                        isPreparing = false
                        this@MainActivity.isPlaying = true
                        preparedSongId = song.stableId
                        durationMs = safeDuration(player)
                        if (seekMs > 0) player.seekTo(seekMs)
                        val startResult = runCatching { player.start() }
                        if (startResult.isFailure) {
                            isPreparing = false
                            this@MainActivity.isPlaying = false
                            statusLabel.text = "เริ่มเล่นไม่สำเร็จ"
                            updatePlayPauseIcon()
                            syncNotification()
                            savePlaybackState()
                            audioService?.releasePlaybackLocks()
                            return@setOnPreparedListener
                        }
                        playbackBasePositionMs = seekMs.coerceAtLeast(0)
                        playbackStartedAtMs = System.currentTimeMillis()
                        resumePositionMs = playbackBasePositionMs
                        statusLabel.text = "กำลังเล่น"
                        updatePlayPauseIcon()
                        syncNotification()
                        savePlaybackState()
                    }
                    setOnCompletionListener {
                        if (generation == playbackGeneration) next(useCrossfade = false)
                    }
                    setOnErrorListener { _, what, extra ->
                        if (generation != playbackGeneration) return@setOnErrorListener true
                        isPreparing = false
                        this@MainActivity.isPlaying = false
                        statusLabel.text = "เล่นไฟล์ไม่สำเร็จ ($what/$extra)"
                        updatePlayPauseIcon()
                        syncNotification()
                        savePlaybackState()
                        true
                    }
                    prepareAsync()
                }
            }
        }
    }

    private fun downloadAudioToCache(song: NativeSong): File? {
        val safeName = song.stableId.replace(Regex("[^A-Za-z0-9._-]"), "_")
        val file = File(cacheDir, "musicbar_$safeName.mp3")
        if (file.exists() && file.length() > 1024 * 128) return file

        var success = false
        try {
            val connection = (URL(song.audioUrl).openConnection() as HttpURLConnection).apply {
                connectTimeout = 15000
                readTimeout = 30000
                setRequestProperty("User-Agent", "MusicBarAndroid/1.0")
                setRequestProperty("Accept", "audio/mpeg,audio/*;q=0.9,*/*;q=0.8")
            }
            connection.inputStream.use { input ->
                file.outputStream().use { output -> input.copyTo(output) }
            }
            val expected = connection.contentLength
            success = file.length() > 0 && (expected <= 0 || file.length() >= expected)
            if (success) return file
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            if (!success) {
                runCatching { file.delete() }
            }
        }
        return null
    }

    private fun pause() {
        playbackGeneration++
        isPlaying = false
        isPreparing = false
        setLoadingState(false, "หยุดชั่วคราว")
        val player = mediaPlayer
        resumePositionMs = if (player != null) safeCurrentPosition(player) else resumePositionMs
        if (player != null) {
            if (runCatching { player.isPlaying }.getOrDefault(false)) {
                runCatching { player.pause() }
            } else if (preparedSongId.isBlank()) {
                releasePlayer()
            }
        }
        playbackBasePositionMs = resumePositionMs
        playbackStartedAtMs = 0L
        updatePlayPauseIcon()
        syncNotification()
        savePlaybackState()
        audioService?.releasePlaybackLocks()
    }

    private fun next(useCrossfade: Boolean) {
        if (songs.isEmpty()) return
        val nextIndex = findPlayableIndex(currentIndex, forward = true, includeCurrent = false)
        if (nextIndex != -1) {
            val shouldPlay = isPlaying || isPreparing || runCatching { mediaPlayer?.isPlaying == true }.getOrDefault(false)
            val nextSong = songs[nextIndex]
            if (useCrossfade && shouldPlay && runCatching { mediaPlayer?.isPlaying == true }.getOrDefault(false)) {
                crossfadeTo(nextIndex, nextSong)
            } else {
                currentIndex = nextIndex
                resumePositionMs = 0
                renderCurrentSong()
                if (shouldPlay) startSong(nextSong, 0)
            }
            return
        }

        statusLabel.text = "ไม่มีเพลงที่เล่นได้"
        isPlaying = false
        isPreparing = false
        updatePlayPauseIcon()
        syncNotification()
        savePlaybackState()
    }

    private fun crossfadeTo(nextIndex: Int, nextSong: NativeSong) {
        val generation = ++playbackGeneration
        statusLabel.text = "กำลังเปลี่ยนเพลง"
        val fromPlayer = mediaPlayer ?: return
        val toPlayer = try {
            createPlayer(nextSong.audioUrl)
        } catch (e: Exception) {
            e.printStackTrace()
            currentIndex = nextIndex
            resumePositionMs = 0
            renderCurrentSong()
            startSong(nextSong, 0)
            return
        }
        fadingPlayer = toPlayer
        toPlayer.setVolume(0f, 0f)
        toPlayer.setOnPreparedListener {
            if (generation != playbackGeneration || !isPlaying) {
                runCatching { it.release() }
                return@setOnPreparedListener
            }
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
                        preparedSongId = nextSong.stableId
                        durationMs = safeDuration(toPlayer).takeIf { it > 0 } ?: parseDuration(nextSong.duration) * 1000
                        playbackBasePositionMs = 0
                        playbackStartedAtMs = System.currentTimeMillis()
                        renderCurrentSong()
                        statusLabel.text = "กำลังเล่น"
                        syncNotification()
                        savePlaybackState()
                    } else {
                        mainHandler.postDelayed(this, 100)
                    }
                }
            }
            mainHandler.post(tick)
        }
        toPlayer.setOnCompletionListener { next(useCrossfade = false) }
        toPlayer.setOnErrorListener { _, _, _ ->
            if (generation == playbackGeneration) {
                currentIndex = nextIndex
                resumePositionMs = 0
                renderCurrentSong()
                startSong(nextSong, 0)
            }
            true
        }
        toPlayer.prepareAsync()
    }

    private fun previous() {
        if (songs.isEmpty()) return
        val prevIndex = findPlayableIndex(currentIndex, forward = false, includeCurrent = false)
        if (prevIndex != -1) {
            val shouldPlay = isPlaying || isPreparing || runCatching { mediaPlayer?.isPlaying == true }.getOrDefault(false)
            val prevSong = songs[prevIndex]
            currentIndex = prevIndex
            resumePositionMs = 0
            renderCurrentSong()
            if (shouldPlay) startSong(prevSong, 0)
            return
        }

        statusLabel.text = "ไม่มีเพลงที่เล่นได้"
        isPlaying = false
        isPreparing = false
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
                "next", "crossfade" -> next(useCrossfade = action == "crossfade" && crossfadeEnabled)
                "previous" -> previous()
            }
        }
    }

    // ===================== UI Helpers =====================

    private fun updatePlayPauseIcon() {
        playPauseButton.setImageResource(if (isPlaying) R.drawable.ic_pause else R.drawable.ic_play)
        playPauseButton.contentDescription = if (isPlaying) "Pause" else "Play"
    }

    private fun updateCrossfadeToggle() {
        crossfadeToggle.alpha = if (crossfadeEnabled) 1f else 0.4f
        crossfadeToggle.setColorFilter(
            if (crossfadeEnabled) ContextCompat.getColor(this, R.color.progress_fill)
            else android.graphics.Color.WHITE
        )
    }

    private fun updateProgressFromPlayer() {
        val player = mediaPlayer
        val position = if (player != null && !isPreparing) safeCurrentPosition(player) else resumePositionMs
        val duration = if (player != null && !isPreparing) safeDuration(player) else durationMs
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
        val position = if (player != null && !isPreparing) safeCurrentPosition(player) else resumePositionMs
        val duration = if (player != null && !isPreparing) safeDuration(player) else durationMs
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
        val position = mediaPlayer?.let { safeCurrentPosition(it) } ?: resumePositionMs
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
        if (value.startsWith("PT")) {
            val hours = Regex("(\\d+)H").find(value)?.groupValues?.getOrNull(1)?.toIntOrNull() ?: 0
            val minutes = Regex("(\\d+)M").find(value)?.groupValues?.getOrNull(1)?.toIntOrNull() ?: 0
            val seconds = Regex("(\\d+)S").find(value)?.groupValues?.getOrNull(1)?.toIntOrNull() ?: 0
            return hours * 3600 + minutes * 60 + seconds
        }
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

    private fun safeCurrentPosition(player: MediaPlayer): Int {
        val actual = runCatching { player.currentPosition }.getOrDefault(0)
        if (actual > 0) {
            return actual
        }
        if (isPlaying && !isPreparing && playbackStartedAtMs > 0L) {
            val elapsed = (System.currentTimeMillis() - playbackStartedAtMs).toInt().coerceAtLeast(0)
            return (playbackBasePositionMs + elapsed).coerceAtMost(max(1, durationMs))
        }
        return resumePositionMs
    }

    private fun safeDuration(player: MediaPlayer): Int {
        return runCatching { player.duration }.getOrDefault(durationMs).takeIf { it > 0 } ?: durationMs
    }

    private fun absoluteUrl(url: String): String {
        val clean = url.trim()
        return when {
            clean.isBlank() || clean == "null" -> ""
            clean.startsWith("http://") || clean.startsWith("https://") -> clean
            clean.startsWith("/") -> "$baseUrl$clean"
            else -> clean
        }
    }

    private fun releasePlayer() {
        runCatching { mediaPlayer?.release() }
        mediaPlayer = null
        runCatching { fadingPlayer?.release() }
        fadingPlayer = null
        preparedSongId = ""
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
    var audioUrl: String,
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
