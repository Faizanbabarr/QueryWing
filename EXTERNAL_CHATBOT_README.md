# QueryWing External Chatbot

The external chatbot widget allows you to embed AI assistants on any website with live chat agent support. It's designed to match the internal chatbot functionality while providing seamless integration with external websites.

## Features

- 🎯 **Dynamic Bot Names**: Each bot displays its custom name from the dashboard
- 💬 **Live Agent Flow**: Seamlessly transition from AI to human agents
- 🎨 **Customizable Design**: Choose colors, positions, and styling
- 📱 **Mobile Responsive**: Works perfectly on all devices
- 🔄 **Real-time Updates**: Live agent messages appear instantly
- 📊 **Lead Generation**: Automatic lead capture and management

## Quick Start

### 1. Create a Bot in Dashboard

1. Go to your QueryWing dashboard
2. Navigate to "AI Bots" section
3. Click "Create Bot"
4. Configure:
   - **Bot Name**: What users will see (e.g., "Customer Support Bot")
   - **Description**: Brief description of the bot's purpose
   - **Instructions**: Detailed behavior and personality guidelines

### 2. Get Embed Code

1. In the bots list, find your bot
2. Click the "Copy Code" button in the Widget Settings section
3. The embed code will include:
   - Bot ID
   - Bot Name
   - Primary Color
   - Position

### 3. Embed on Your Website

Paste the embed code before the closing `</body>` tag:

```html
<script async src="https://your-domain.com/widget.js" 
        data-bot-id="your-bot-id" 
        data-bot-name="Your Bot Name" 
        data-primary-color="#6366f1" 
        data-position="bottom-right">
</script>
```

## Configuration Options

### Data Attributes

| Attribute | Description | Default | Options |
|-----------|-------------|---------|---------|
| `data-bot-id` | Unique identifier for your bot | Required | Any string |
| `data-bot-name` | Display name for the bot | "AI Assistant" | Any string |
| `data-primary-color` | Primary color for the widget | "#6366f1" | Any hex color |
| `data-position` | Widget position on screen | "bottom-right" | "bottom-right", "bottom-left" |

### Example Configurations

#### Customer Support Bot
```html
<script async src="/widget.js" 
        data-bot-id="support-bot-001" 
        data-bot-name="Customer Support" 
        data-primary-color="#10b981" 
        data-position="bottom-right">
</script>
```

#### Sales Assistant
```html
<script async src="/widget.js" 
        data-bot-id="sales-bot-001" 
        data-bot-name="Sales Assistant" 
        data-primary-color="#f59e0b" 
        data-position="bottom-left">
</script>
```

## Live Agent Flow

### How It Works

1. **User starts conversation** with the AI bot
2. **User requests live agent** by clicking "Connect Live Agent"
3. **Bot connects to live agent system** and notifies agents
4. **Live agent responds** through the dashboard
5. **Messages appear in real-time** in the widget
6. **User can disconnect** and return to AI mode

### Live Agent Features

- **Real-time messaging**: Live agent responses appear instantly
- **Status indicators**: Clear visual feedback about connection status
- **Seamless handoff**: Smooth transition between AI and human agents
- **Message history**: Complete conversation context maintained

## Dashboard Integration

### Live Chat Management

1. **Live Requests**: View all live agent requests in real-time
2. **Message Handling**: Respond to users directly from the dashboard
3. **Status Management**: Mark conversations as active, queued, or closed
4. **Agent Assignment**: Assign conversations to specific team members

### Bot Management

1. **Create Multiple Bots**: Different bots for different purposes
2. **Custom Instructions**: Tailor each bot's personality and behavior
3. **Performance Tracking**: Monitor conversations and lead generation
4. **Widget Customization**: Adjust colors, positions, and branding

## Advanced Features

### Lead Generation

The widget automatically captures leads when users:
- Provide email addresses
- Request pricing information
- Ask about demos or sales
- Show purchase intent

### Analytics

Track important metrics:
- Conversation volume
- Lead generation rates
- Live agent usage
- User engagement patterns

### Customization

- **Brand Colors**: Match your website's color scheme
- **Positioning**: Choose where the widget appears
- **Styling**: Customize the visual appearance
- **Behavior**: Configure bot responses and actions

## Testing

### Demo Page

Visit `/demo-external.html` to test different bot configurations:
- Customer Support Bot (green theme)
- Sales Assistant (orange theme)
- Technical Support (blue theme)

### Local Development

1. Start your QueryWing development server
2. Open the demo page
3. Test different bot configurations
4. Verify live agent functionality

## Troubleshooting

### Common Issues

1. **Widget not appearing**
   - Check if the script is loaded before `</body>`
   - Verify the bot ID exists in your dashboard
   - Check browser console for errors

2. **Live agent not connecting**
   - Ensure live chat is enabled in dashboard
   - Check if agents are available
   - Verify API endpoints are accessible

3. **Styling issues**
   - Check CSS conflicts with your website
   - Verify color values are valid hex codes
   - Test on different screen sizes

### Debug Mode

Enable debug logging by adding this before the widget script:

```html
<script>
  window.QUERYWING_DEBUG = true;
</script>
```

## API Reference

### Widget Events

The widget emits custom events you can listen to:

```javascript
// Widget opened
window.addEventListener('qw:opened', (event) => {
  console.log('Chat widget opened');
});

// Message sent
window.addEventListener('qw:message', (event) => {
  console.log('Message sent:', event.detail);
});

// Live agent connected
window.addEventListener('qw:live-agent-connected', (event) => {
  console.log('Live agent connected');
});
```

### Widget Methods

Access widget methods through the global object:

```javascript
// Open widget programmatically
window.queryWingWidget.open();

// Close widget programmatically
window.queryWingWidget.close();

// Send message programmatically
window.queryWingWidget.sendMessage('Hello from JavaScript');

// Connect to live agent
window.queryWingWidget.connectLiveAgent();
```

## Security

### Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Domain Restrictions**: Configure allowed domains in dashboard
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Input Validation**: Sanitize user inputs before processing

### Privacy

- User data is encrypted in transit
- Conversations are stored securely
- GDPR compliance features included
- User consent management

## Support

### Getting Help

1. **Documentation**: Check this README and dashboard guides
2. **Dashboard**: Use the help section in your dashboard
3. **Community**: Join our community forums
4. **Support**: Contact support for technical issues

### Updates

- Widget updates automatically
- New features added regularly
- Backward compatibility maintained
- Migration guides provided

## Changelog

### Version 2.0.0
- Added live agent flow
- Dynamic bot names from dashboard
- Enhanced customization options
- Improved mobile responsiveness

### Version 1.0.0
- Initial release
- Basic chatbot functionality
- Lead generation
- Dashboard integration

---

For more information, visit your QueryWing dashboard or contact support.
