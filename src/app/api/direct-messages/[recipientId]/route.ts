import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'

/**
 * GET /api/direct-messages/[recipientId]
 * Get all DMs between the current user and a specific recipient.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ recipientId: string }> }
) {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ messages: [] })

    const { recipientId } = await params

    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ messages: [] })

    // Get all DMs between these two users (in both directions)
    const { data: messages, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
            `and(sender_id.eq.${user.user_id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.user_id})`
        )
        .order('sent_at', { ascending: true })

    if (error) return NextResponse.json({ messages: [] })

    // Mark unread messages as read (ones sent TO the current user)
    const unreadIds = (messages ?? [])
        .filter(m => m.recipient_id === user.user_id && !m.read)
        .map(m => m.dm_id)

    if (unreadIds.length > 0) {
        await supabase
            .from('direct_messages')
            .update({ read: true })
            .in('dm_id', unreadIds)
    }

    return NextResponse.json({ messages: messages ?? [] })
}
