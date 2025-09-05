# 🤖 Bot Deletion Handling & Graceful Degradation

## Overview
This document explains how the QueryWing chatbot system now handles bot deletion gracefully, preventing broken chat widgets and providing clear user feedback.

## 🚨 Problem Solved
Previously, if a bot was deleted from the database, the chatbot widget would continue to try to send messages to a non-existent bot, causing:
- 404 errors
- Broken chat functionality
- Poor user experience
- No clear indication of what went wrong

## ✅ Solution Implemented

### 1. **Early Bot Validation**
- Bot status is checked during conversation initialization
- Deleted bots are detected immediately when the widget loads
- Prevents users from starting conversations with non-existent bots

### 2. **Graceful Error Handling**
- Specific error messages for different bot states
- Clear indication when a bot has been deleted
- Helpful guidance for users

### 3. **Widget State Management**
- Chat input is disabled when bot is deleted
- Visual indicators show bot unavailability
- Launcher color changes to red when bot is down

### 4. **API Endpoint Protection**
- Chat API validates bot existence before processing messages
- Bot status is checked (active/inactive)
- Proper error responses for deleted bots

## 🔧 Technical Implementation

### Chat API (`/api/v1/chat`)
```typescript
// Verify bot exists and is active
const bot = await db.bot.findUnique({
  where: { id: botId }
})

if (!bot) {
  return NextResponse.json(
    { error: 'Bot not found or has been deleted' },
    { status: 404 }
  )
}

if (bot.status !== 'active') {
  return NextResponse.json(
    { error: 'Bot is currently inactive' },
    { status: 400 }
  )
}
```

### Widget Error Handling
```javascript
// Handle bot deletion specifically
if (response.status === 404 && errorData.error?.includes('deleted')) {
  this.handleBotDeleted();
}

// Disable chat functionality
handleBotDeleted() {
  const input = document.querySelector('.qw-message-input');
  const sendBtn = document.querySelector('.qw-send-btn');
  
  if (input) input.disabled = true;
  if (sendBtn) sendBtn.disabled = true;
  
  // Show warning message
  this.addMessage('bot', '🚫 This chatbot is no longer available. The chat has been disabled.');
}
```

### Bot Status Check (`/api/v1/bots/[id]`)
```typescript
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const bot = await db.bot.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      status: true,
      published: true
    }
  })

  if (!bot) {
    return NextResponse.json(
      { error: 'Bot not found or has been deleted' },
      { status: 404 }
    )
  }

  if (bot.status !== 'active') {
    return NextResponse.json(
      { error: 'Bot is currently inactive' },
      { status: 400 }
    )
  }
}
```

## 📱 User Experience

### When Bot is Deleted:
1. **Immediate Detection**: Bot status is checked when widget loads
2. **Clear Messaging**: "⚠️ This chatbot has been deleted or is no longer available"
3. **Disabled Interface**: Chat input and buttons are disabled
4. **Visual Indicators**: 
   - Header shows "Chatbot Unavailable"
   - Launcher turns red
   - Warning messages are displayed

### Error Messages:
- **Bot Deleted**: "⚠️ This chatbot has been deleted or is no longer available. Please contact the website administrator for assistance."
- **Bot Inactive**: "⚠️ This chatbot is currently inactive. Please try again later or contact support."
- **Network Issues**: "I'm having trouble connecting to my knowledge base right now. Please check your internet connection and try again."

## 🛠️ Monitoring & Debugging

### Bot Health Check (`/api/v1/bots/health`)
```json
{
  "overall": "healthy",
  "metrics": {
    "total": 3,
    "active": 2,
    "published": 2,
    "inactive": 1,
    "needsAttention": 0
  },
  "bots": [
    {
      "id": "demo-bot-1",
      "name": "Customer Support Bot",
      "status": "active",
      "published": true,
      "conversationCount": 15,
      "leadCount": 8
    }
  ]
}
```

### Console Logging:
- Bot deletion events are logged with warnings
- Conversation initialization failures are tracked
- API errors are logged for debugging

## 🔄 Recovery Process

### For Website Owners:
1. **Check Bot Status**: Use `/api/v1/bots/health` endpoint
2. **Restore Bot**: Recreate the bot with the same ID
3. **Verify Configuration**: Ensure bot is active and published
4. **Test Widget**: Verify chatbot functionality is restored

### For Developers:
1. **Monitor Logs**: Check for bot deletion warnings
2. **Database Cleanup**: Remove orphaned conversations/messages
3. **Widget Updates**: Update widget configuration if needed

## 🚀 Benefits

1. **Better User Experience**: Clear communication about bot status
2. **Reduced Support Tickets**: Users understand what's happening
3. **Easier Debugging**: Specific error messages for different scenarios
4. **Graceful Degradation**: Widget doesn't break completely
5. **Professional Appearance**: Maintains brand image even when issues occur

## 📋 Testing Scenarios

### Test 1: Delete Bot While Widget is Open
1. Open chatbot widget
2. Delete bot from database
3. Try to send a message
4. Verify error message and disabled state

### Test 2: Load Widget with Deleted Bot
1. Delete bot from database
2. Refresh page with widget
3. Verify immediate detection and disabled state

### Test 3: Bot Status Changes
1. Change bot status to 'inactive'
2. Verify appropriate error message
3. Reactivate bot and verify functionality returns

## 🔒 Security Considerations

- Bot ID validation prevents unauthorized access
- Status checks ensure only active bots can be used
- Error messages don't expose sensitive information
- API endpoints are properly protected

## 📚 Related Files

- `src/app/api/v1/chat/route.ts` - Main chat API with bot validation
- `src/app/api/v1/bots/[id]/route.ts` - Bot status check endpoint
- `src/app/api/v1/bots/health/route.ts` - Bot health monitoring
- `public/widget.js` - Widget with graceful error handling
- `public/test-chatbot.html` - Test page for bot functionality

## 🎯 Future Enhancements

1. **Automatic Recovery**: Attempt to reconnect if bot becomes available again
2. **Fallback Bots**: Switch to backup bot if primary is deleted
3. **Admin Notifications**: Alert administrators when bots are deleted
4. **Analytics**: Track bot deletion events and recovery times
5. **User Feedback**: Allow users to report broken chatbots

---

**Status**: ✅ Implemented and Tested  
**Last Updated**: Current Date  
**Maintainer**: QueryWing Development Team

