import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'

/**
 * POST /api/direct-messages
 * Send a direct message to another user (no job required).
 * Body: { recipientId, content }
 */
export async function POST(req: NextRequest) {
    const user = await getCurrentUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { recipientId, content } = await req.json()
    if (!recipientId || !content?.trim()) {
        return NextResponse.json({ error: 'recipientId and content are required' }, { status: 400 })
    }

    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    const { data, error } = await supabase
        .from('direct_messages')
        .insert({
            sender_id: user.user_id,
            recipient_id: recipientId,
            content: content.trim(),
            read: false,
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Best-effort notification — ignore errors if table doesn't exist
    void Promise.resolve(
        supabase.from('notifications').insert({
            user_id: recipientId,
            title: 'New Message',
            body: `${user.company_name ?? user.name} sent you a message`,
            type: 'message',
            read: false,
            reference_id: user.user_id,
        })
    ).catch(() => {})

    return NextResponse.json({ message: data })
}

/**
 * GET /api/direct-messages
 * List all DM conversations for the current user.
 * Returns a list of unique conversation partners with the latest message.
 */
export async function GET(req: NextRequest) {
    const user = await getCurrentUser(req)
    if (!user) return NextResponse.json({ conversations: [] })

    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ conversations: [] })

    // Get all DMs where the user is sender or recipient
    const { data: dms, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.user_id},recipient_id.eq.${user.user_id}`)
        .order('sent_at', { ascending: false })

    if (error || !dms?.length) return NextResponse.json({ conversations: [] })

    // Group by the other party
    const convMap = new Map<string, { otherPartyId: string; lastMessage: string; lastSentAt: string; unreadCount: number }>()

    for (const dm of dms) {
        const otherPartyId = dm.sender_id === user.user_id ? dm.recipient_id : dm.sender_id
        if (!convMap.has(otherPartyId)) {
            convMap.set(otherPartyId, {
                otherPartyId,
                lastMessage: dm.content,
                lastSentAt: dm.sent_at,
                unreadCount: 0,
            })
        }
        // Count unread messages sent TO the current user
        if (dm.recipient_id === user.user_id && !dm.read) {
            const entry = convMap.get(otherPartyId)!
            entry.unreadCount++
        }
    }

    // Fetch user details for the other parties
    const otherIds = Array.from(convMap.keys())
    const { data: users } = await supabase
        .from('users')
        .select('user_id, name, company_name, role')
        .in('user_id', otherIds)

    const userMap = new Map((users ?? []).map((u: { user_id: string; name: string; company_name: string | null; role: string }) => [u.user_id, u]))

    const conversations = Array.from(convMap.values()).map(conv => {
        const otherUser = userMap.get(conv.otherPartyId)
        return {
            type: 'dm' as const,
            recipientId: conv.otherPartyId,
            otherPartyName: otherUser?.company_name ?? otherUser?.name ?? 'Unknown',
            otherPartyRole: otherUser?.role ?? 'UNKNOWN',
            lastMessage: conv.lastMessage,
            lastSentAt: conv.lastSentAt,
            unreadCount: conv.unreadCount,
        }
    })

    return NextResponse.json({ conversations })
}
