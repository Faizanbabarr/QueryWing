import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { conversationId, rating, feedback } = await request.json()

    if (!conversationId || !rating) {
      return NextResponse.json(
        { error: 'Conversation ID and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if conversation exists
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Create or update rating
    const ratingRecord = await db.conversationRating.upsert({
      where: { conversationId },
      update: {
        rating,
        feedback: feedback || null,
        updatedAt: new Date()
      },
      create: {
        conversationId,
        rating,
        feedback: feedback || null,
        tenantId: conversation.tenantId
      }
    })

    // Update conversation with average rating if multiple ratings exist
    const allRatings = await db.conversationRating.findMany({
      where: { conversationId }
    })

    if (allRatings.length > 0) {
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      
      await db.conversation.update({
        where: { id: conversationId },
        data: {
          avgRating: Math.round(avgRating * 10) / 10,
          ratingCount: allRatings.length
        }
      })
    }

    return NextResponse.json({
      success: true,
      rating: ratingRecord,
      message: 'Rating saved successfully'
    })

  } catch (error) {
    console.error('Error saving conversation rating:', error)
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    const rating = await db.conversationRating.findUnique({
      where: { conversationId }
    })

    return NextResponse.json({
      rating: rating || null
    })

  } catch (error) {
    console.error('Error fetching conversation rating:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rating' },
      { status: 500 }
    )
  }
}
