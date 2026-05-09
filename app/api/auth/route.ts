import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { pin } = await request.json()
    
    const settings = await sql`
      SELECT value FROM app_settings WHERE key = 'admin_pin'
    `
    
    if (settings.length === 0 || settings[0].value !== pin) {
      return NextResponse.json({ error: 'PIN ไม่ถูกต้อง' }, { status: 401 })
    }
    
    // Set auth cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error verifying PIN:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const isAuth = cookieStore.get('admin_auth')?.value === 'true'
    return NextResponse.json({ authenticated: isAuth })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin_auth')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
