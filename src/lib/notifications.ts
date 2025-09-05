import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'

type PrefKey = 'leads' | 'conversations' | 'weeklyReports'

async function getEmailRecipients(tenantId: string, key: PrefKey): Promise<Array<{email: string; name: string}>> {
  try {
    const users = await db.user.findMany({
      where: { tenantId },
      select: { email: true, name: true, notificationPreferences: true }
    })
    return users
      .filter(u => {
        const prefs = (u as any).notificationPreferences || {}
        return prefs?.email !== false && prefs?.[key] === true
      })
      .map(u => ({ email: u.email, name: u.name }))
  } catch {
    return []
  }
}

export async function notifyLeadCreated(params: {
  tenantId: string
  lead: { id: string; name?: string | null; email?: string | null; phone?: string | null; company?: string | null }
}) {
  const recipients = await getEmailRecipients(params.tenantId, 'leads')
  if (!recipients.length) return

  const subject = `New lead captured: ${params.lead.name || params.lead.email || params.lead.id}`
  const html = `
    <h2>New Lead Captured</h2>
    <p>A new lead was captured by your assistant.</p>
    <ul>
      <li><b>Name:</b> ${params.lead.name || 'N/A'}</li>
      <li><b>Email:</b> ${params.lead.email || 'N/A'}</li>
      <li><b>Phone:</b> ${params.lead.phone || 'N/A'}</li>
      <li><b>Company:</b> ${params.lead.company || 'N/A'}</li>
      <li><b>Lead ID:</b> ${params.lead.id}</li>
    </ul>
  `

  await Promise.all(
    recipients.map(r => sendEmail({ to: r.email, subject, html }))
  )
}

export async function notifyLiveAgentRequested(params: {
  tenantId: string
  conversationId: string
}) {
  const recipients = await getEmailRecipients(params.tenantId, 'conversations')
  if (!recipients.length) return

  const subject = 'Live agent requested'
  const html = `
    <h2>Live Agent Requested</h2>
    <p>A visitor requested a live agent handoff.</p>
    <p><b>Conversation ID:</b> ${params.conversationId}</p>
  `

  await Promise.all(
    recipients.map(r => sendEmail({ to: r.email, subject, html }))
  )
}

export async function sendWeeklyReportEmail(params: {
  tenantId: string
  toAll?: boolean
}) {
  const recipients = await getEmailRecipients(params.tenantId, 'weeklyReports')
  if (!recipients.length) return

  // Basic placeholder metrics – replace with real analytics as desired
  const subject = 'Your weekly QueryWing report'
  const html = `
    <h2>Weekly Report</h2>
    <p>Here is your weekly summary. (Demo content)</p>
    <ul>
      <li>Total conversations: —</li>
      <li>Total leads: —</li>
    </ul>
  `

  await Promise.all(
    recipients.map(r => sendEmail({ to: r.email, subject, html }))
  )
}


