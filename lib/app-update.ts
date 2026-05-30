import { toast } from 'sonner'

/**
 * ฟังก์ชันสำหรับบังคับอัปเดตแอปพลิเคชัน (PWA Force Update & Cache Clearing)
 * @param setIsUpdating ฟังก์ชันสำหรับควบคุมสถานะการโหลดของปุ่ม UI
 */
export async function forceUpdateApp(setIsUpdating?: (loading: boolean) => void) {
  if (typeof window === 'undefined') return

  if (setIsUpdating) setIsUpdating(true)
  const toastId = toast.loading('กำลังตรวจสอบเวอร์ชันใหม่...')

  // กรณีเบราว์เซอร์ไม่รองรับ Service Worker
  if (!('serviceWorker' in navigator)) {
    setTimeout(() => {
      toast.dismiss(toastId)
      toast.success('กำลังบังคับรีเฟรชระบบ...')
      window.location.reload()
    }, 1000)
    return
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    
    if (registrations.length === 0) {
      // ไม่มี Service Worker ลงทะเบียนไว้เลย ให้ล้างแคชและรีเฟรชหน้าเว็บใหม่
      await clearAllCaches()
      toast.dismiss(toastId)
      toast.success('ล้างแคชเรียบร้อยแล้ว กำลังเริ่มระบบใหม่...')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      return
    }

    let updateFound = false

    for (const registration of registrations) {
      // สั่งให้ Service Worker ไปดึงข้อมูลใหม่จาก Server ทันที
      await registration.update()

      // ตรวจสอบว่ามี Service Worker ตัวใหม่ที่รอติดตั้งอยู่หรือไม่ (Waiting)
      if (registration.waiting) {
        updateFound = true
        toast.dismiss(toastId)
        toast.success('พบเวอร์ชันใหม่! กำลังทำการติดตั้งและเริ่มต้นใหม่...')
        
        // ส่งข้อความ SKIP_WAITING ไปยัง Service Worker ตัวใหม่เพื่อให้ทำงานทันที
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        break
      }
    }

    // หากไม่พบอัปเดตของ Service Worker ให้ล้างแคชเบราว์เซอร์และ Hard Reload
    if (!updateFound) {
      await clearAllCaches()
      toast.dismiss(toastId)
      toast.success('แอปพลิเคชันเป็นเวอร์ชันล่าสุดแล้ว ระบบทำความสะอาดแคชเรียบร้อย')
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }

  } catch (error) {
    console.error('[MusicBar] Failed to force update app:', error)
    toast.dismiss(toastId)
    toast.error('เกิดข้อผิดพลาดในการตรวจสอบรุ่นของระบบ กำลังบังคับรีโหลด...')
    
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  } finally {
    if (setIsUpdating) {
      setTimeout(() => setIsUpdating(false), 1000)
    }
  }
}

/**
 * ฟังก์ชันภายในสำหรับล้าง Cache Storage ทั้งหมดในเบราว์เซอร์
 */
async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) return
  try {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
    console.log('[MusicBar] All cache storages cleared successfully')
  } catch (err) {
    console.error('[MusicBar] Error clearing cache storages:', err)
  }
}
