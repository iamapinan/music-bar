package ai.gracer.musicbar

import android.Manifest
import android.content.ComponentName
import android.content.ServiceConnection
import android.os.IBinder
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.view.inputmethod.InputMethodManager
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: BackgroundWebView
    private var audioService: BackgroundAudioService? = null
    private var isBound = false

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as BackgroundAudioService.LocalBinder
            audioService = binder.getService()
            isBound = true
            audioService?.setWebView(webView)
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // เปิดใช้งาน Hardware Acceleration เพื่อเพิ่มประสิทธิภาพในการแสดงผลวิดีโอและควบคุมคิวเพลง
        window.setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        )
        
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        setupWebView()

        // ขอสิทธิ์แสดงการแจ้งเตือน (สำหรับ Android 13 ขึ้นไป)
        checkAndRequestNotificationsPermission()

        // ลงทะเบียน Broadcast Receiver เพื่อรอรับคำสั่งสั่งการปิดแอปจากการแจ้งเตือน
        registerStopReceiver()

        // เริ่มต้นการทำงานของ Foreground Service
        startAudioService()
        bindAudioService()
    }

    private fun setupWebView() {
        webView.addJavascriptInterface(AndroidBridge(), "AndroidBridge")
        
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            // ใช้ User-Agent แบบเบราว์เซอร์สมัยใหม่เพื่อให้หน้าเว็บทำงานได้ครบทุกฟังก์ชันอย่างลื่นไหล
            userAgentString = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 MusicBarApp"
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                // บังคับให้โหลดลิงก์ทั้งหมดภายในแอปพลิเคชัน ไม่เปิดเว็บเบราว์เซอร์ภายนอก
                return false
            }
        }
        
        webView.webChromeClient = WebChromeClient()
        webView.isFocusable = true
        webView.isFocusableInTouchMode = true
        webView.requestFocus()
        webView.setOnFocusChangeListener { view, hasFocus ->
            if (hasFocus) {
                val inputMethodManager = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                inputMethodManager.showSoftInput(view, InputMethodManager.SHOW_IMPLICIT)
            }
        }

        // ดึงข้อมูลและโหลดหน้าเล่นเพลง Music Bar
        webView.loadUrl("https://musicbar.gracer.ai")
    }

    private fun startAudioService() {
        val serviceIntent = Intent(this, BackgroundAudioService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
    }

    private fun bindAudioService() {
        val intent = Intent(this, BackgroundAudioService::class.java)
        bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE)
    }

    private fun checkAndRequestNotificationsPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    101
                )
            }
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

    override fun onBackPressed() {
        // เมื่อกดปุ่มย้อนกลับให้ทำงานภายในประวัติของหน้าเว็บก่อน แทนที่จะออกจากแอปทันที
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    // จุดสำคัญ: ห้ามเรียกใช้ webView.onPause() หรือ webView.onStop() ใน Activity Lifecycle 
    // เพื่ออนุญาตให้เอนจินของเบราว์เซอร์เล่นมีเดียและรัน JavaScript ต่อไปได้แม้ย่อแอปพลิเคชัน
    override fun onPause() {
        super.onPause()
    }

    override fun onStop() {
        super.onStop()
    }

    override fun onDestroy() {
        try {
            unregisterReceiver(stopReceiver)
        } catch (e: Exception) {
            e.printStackTrace()
        }
        if (isBound) {
            unbindService(serviceConnection)
            isBound = false
        }
        webView.destroy()
        super.onDestroy()
    }

    inner class AndroidBridge {
        @android.webkit.JavascriptInterface
        fun updatePlaybackState(isPlaying: Boolean, title: String, artist: String, thumbnailUrl: String, position: Long, duration: Long) {
            runOnUiThread {
                if (isBound && audioService != null) {
                    audioService?.updatePlaybackState(isPlaying, title, artist, thumbnailUrl, position, duration)
                }
            }
        }
    }
}
