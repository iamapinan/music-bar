import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { normalizeTenantSlug } from '@/lib/tenancy'

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function sendDiscordNotification(app: {
  store_name: string
  requested_slug: string | null
  applicant_name: string
  applicant_email: string
  phone: string | null
  notes: string | null
}) {
  const webhookUrl = process.env.DISCORD_HOOK
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: `🆕 มีคำขอเปิดสถานีเพลงใหม่เข้ามา! 📻`,
        embeds: [
          {
            title: `รายละเอียดคำขอเปิดสถานี: ${app.store_name}`,
            color: 0x3D7BFF,
            fields: [
              { name: 'ชื่อร้าน', value: app.store_name, inline: true },
              { name: 'Slug ที่ต้องการ', value: app.requested_slug || 'ไม่ได้ระบุ', inline: true },
              { name: 'ชื่อผู้ติดต่อ', value: app.applicant_name, inline: true },
              { name: 'Google Email', value: app.applicant_email, inline: true },
              { name: 'เบอร์โทร', value: app.phone || 'ไม่ได้ระบุ', inline: true },
              { name: 'รายละเอียดเพิ่มเติม', value: app.notes || 'ไม่มีรายละเอียดเพิ่มเติม', inline: false }
            ],
            timestamp: new Date().toISOString()
          }
        ]
      })
    })
  } catch (error) {
    console.error('Failed to send Discord notification:', error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const storeName = typeof body.storeName === 'string' ? body.storeName.trim() : ''
    const applicantName = typeof body.applicantName === 'string' ? body.applicantName.trim() : ''
    const applicantEmail = typeof body.applicantEmail === 'string' ? body.applicantEmail.trim().toLowerCase() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const notes = typeof body.notes === 'string' ? body.notes.trim() : ''
    const requestedSlug = normalizeTenantSlug(
      typeof body.requestedSlug === 'string' && body.requestedSlug.trim()
        ? body.requestedSlug
        : storeName,
    )

    if (!storeName || !applicantName || !isEmail(applicantEmail)) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อร้าน ชื่อผู้ติดต่อ และ Google email ให้ถูกต้อง' }, { status: 400 })
    }

    const duplicatePending = await sql`
      SELECT id FROM store_applications
      WHERE lower(applicant_email) = lower(${applicantEmail})
        AND status = 'pending'
      LIMIT 1
    `

    if (duplicatePending[0]) {
      return NextResponse.json({ error: 'email นี้มีคำขอที่รออนุมัติอยู่แล้ว' }, { status: 409 })
    }

    const application = await sql`
      INSERT INTO store_applications (
        store_name,
        requested_slug,
        applicant_name,
        applicant_email,
        phone,
        notes
      )
      VALUES (
        ${storeName},
        ${requestedSlug || null},
        ${applicantName},
        ${applicantEmail},
        ${phone || null},
        ${notes || null}
      )
      RETURNING *
    `

    if (application[0]) {
      await sendDiscordNotification(application[0] as any)
    }

    return NextResponse.json(application[0], { status: 201 })
  } catch (error) {
    console.error('Error creating store application:', error)
    return NextResponse.json({ error: 'Failed to create store application' }, { status: 500 })
  }
}
