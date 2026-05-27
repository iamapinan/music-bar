package ai.gracer.musicbar

import android.content.Context
import android.util.AttributeSet
import android.view.View
import android.webkit.WebView

class BackgroundWebView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : WebView(context, attrs, defStyleAttr) {

    // บังคับให้ WebView คิดว่าหน้าต่างยังถูกแสดงผลอยู่เสมอ (VISIBLE) แม้แอปจะถูกย่อหรือล็อกหน้าจอ
    // วิธีนี้จะช่วยขัดขวางไม่ให้เอนจินของ Chromium สั่งระงับการทำงานของเธรดเสียงหรือหยุดเล่นวิดีโอ YouTube
    override fun onWindowVisibilityChanged(visibility: Int) {
        super.onWindowVisibilityChanged(View.VISIBLE)
    }

    // บังคับให้ระบบส่งสัญญาณบอก WebView ว่าองค์ประกอบหน้าจอทั้งหมดพร้อมใช้งานและเปิดอยู่เสมอ
    override fun onVisibilityChanged(changedView: View, visibility: Int) {
        super.onVisibilityChanged(changedView, View.VISIBLE)
    }
}
