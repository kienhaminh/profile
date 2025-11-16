# Chat Feature Setup Guide

This guide will help you set up and configure the AI-powered chat feature for your portfolio website.

## Overview

The chat feature allows visitors to interact with an AI assistant (powered by Google's Gemini AI) that can answer questions about your background, skills, experience, and projects. The chat is accessible through a subdomain (e.g., `chat.kienha.online`).

## Features

- 🤖 **AI-Powered Responses**: Uses Google Gemini AI to provide intelligent, context-aware responses
- 💬 **Persistent Chat Sessions**: Conversations are stored in the database and persist across page reloads
- 🎨 **Modern UI**: Clean, responsive chat interface built with shadcn/ui components
- 🌐 **Subdomain Access**: Dedicated subdomain routing for professional separation
- 📊 **Session Tracking**: Analytics-ready with session and message tracking

## Prerequisites

Before setting up the chat feature, ensure you have:

1. A Google Cloud account with Gemini API access
2. A Gemini API key
3. PostgreSQL database configured
4. DNS access to configure subdomains

## Setup Instructions

### 1. Get Your Gemini API Key

1. Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key or use an existing one
3. Copy the API key (it will look like: `AIzaSy...`)

### 2. Configure Environment Variables

Add the following to your `.env.local` file in `apps/web/`:

```env
# Gemini AI Configuration
GOOGLE_API_KEY=your_gemini_api_key_here
```

**Important**: The existing codebase already uses `GOOGLE_API_KEY` for blog generation, so this will work for both features.

### 3. Update Knowledge Base

Edit the file `/apps/web/src/config/knowledge-base.ts` to personalize the AI's responses:

```typescript
export const knowledgeBase = {
  personal: {
    name: 'Your Name',
    role: 'Your Role',
    location: 'Your Location',
    email: 'your@email.com',
    website: 'https://yourwebsite.com',
    bio: 'Your bio...',
  },
  skills: {
    languages: ['TypeScript', 'Python', ...],
    frontend: ['React', 'Next.js', ...],
    backend: ['Node.js', 'PostgreSQL', ...],
    // ... add more skills
  },
  experience: [
    {
      title: 'Job Title',
      company: 'Company Name',
      duration: '2020 - Present',
      description: 'What you did...',
      technologies: ['Tech1', 'Tech2'],
    },
    // ... add more experiences
  ],
  // ... update other sections
};
```

### 4. Run Database Migrations

Generate and run the database migrations to create the chat tables:

```bash
# From the root of the monorepo
cd apps/web

# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate:run
```

This will create two new tables:
- `chat_sessions`: Stores chat session information
- `chat_messages`: Stores individual messages

### 5. Configure Subdomain Routing

#### Option A: Local Development

For local testing, you can access the chat at `http://localhost:3000/chat` directly.

To test subdomain routing locally:

1. Edit your `/etc/hosts` file (on macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (on Windows):
   ```
   127.0.0.1 chat.localhost
   ```

2. Access the chat at `http://chat.localhost:3000`

#### Option B: Production Deployment

1. **Configure DNS**:
   - Log in to your DNS provider (Cloudflare, Route53, etc.)
   - Create a new A record or CNAME record:
     - Type: `CNAME` or `A`
     - Name: `chat`
     - Value: Your main domain or server IP
     - TTL: Automatic or 300 seconds

2. **Example DNS Configuration**:
   ```
   Type: CNAME
   Name: chat
   Value: kienha.online
   ```

3. **Verify DNS Propagation**:
   ```bash
   # Check if the subdomain is resolving
   nslookup chat.kienha.online
   ```

4. **SSL Certificate**:
   - If using Vercel/Netlify, wildcard SSL certificates are automatically provisioned
   - If using custom hosting, ensure your SSL certificate covers `*.kienha.online`

### 6. Deploy and Test

1. **Build the application**:
   ```bash
   pnpm build
   ```

2. **Start the server**:
   ```bash
   pnpm start
   ```

3. **Test the chat**:
   - Visit `http://chat.kienha.online` (or your configured subdomain)
   - Send a test message: "What technologies do you work with?"
   - Verify the AI responds with information from your knowledge base

## Architecture

### Components Structure

```
apps/web/src/
├── app/
│   └── chat/
│       └── page.tsx                 # Chat page route
├── components/
│   └── chat/
│       ├── ChatInterface.tsx        # Main chat component
│       ├── ChatMessage.tsx          # Message bubble component
│       └── ChatInput.tsx            # Message input component
├── config/
│   └── knowledge-base.ts            # Your personal information for AI
├── db/
│   └── schema.ts                    # Database schema (includes chat tables)
├── services/
│   ├── chat.ts                      # Chat session/message management
│   └── gemini.ts                    # Gemini AI integration
├── server/trpc/routers/
│   └── _app.ts                      # tRPC router (includes chat endpoints)
└── middleware.ts                    # Subdomain routing logic
```

### Database Schema

**chat_sessions**:
- `id` (UUID): Primary key
- `visitor_id` (TEXT): Optional visitor identifier
- `created_at` (TIMESTAMP): Session creation time
- `updated_at` (TIMESTAMP): Last message time

**chat_messages**:
- `id` (UUID): Primary key
- `session_id` (UUID): Foreign key to chat_sessions
- `role` (TEXT): 'user' or 'assistant'
- `content` (TEXT): Message content
- `created_at` (TIMESTAMP): Message timestamp

### API Endpoints (tRPC)

- `chat.createSession`: Create a new chat session
- `chat.getSession`: Get session by ID
- `chat.getMessages`: Get messages for a session
- `chat.sendMessage`: Send a message and get AI response
- `chat.getRecentSessions`: Get recent sessions (admin/analytics)

## Customization

### Adjust AI Behavior

Edit `/apps/web/src/services/gemini.ts` to modify:

- **Temperature** (0.0 - 1.0): Controls randomness
  - Lower = more focused and deterministic
  - Higher = more creative and varied
  ```typescript
  temperature: 0.7  // Default
  ```

- **Max Tokens**: Controls response length
  ```typescript
  maxOutputTokens: 1024  // Default
  ```

- **Model**: Change the Gemini model
  ```typescript
  model: 'gemini-2.0-flash-001'  // Fast responses
  // or
  model: 'gemini-1.5-pro'        // More capable
  ```

### Customize UI

The chat UI uses Tailwind CSS and shadcn/ui components. Modify:

- **Colors**: Update in `/apps/web/tailwind.config.ts`
- **Layout**: Edit `/apps/web/src/app/chat/page.tsx`
- **Message Styles**: Edit `/apps/web/src/components/chat/ChatMessage.tsx`

## Monitoring and Analytics

### View Chat Sessions

You can query chat sessions directly:

```typescript
// Get recent sessions
const sessions = await trpc.chat.getRecentSessions.query({ limit: 10 });

// Get session messages
const messages = await trpc.chat.getMessages.query({
  sessionId: 'session-id',
  limit: 100
});
```

### Add Analytics

Track chat usage by adding analytics to the chat page:

```typescript
// In ChatInterface.tsx
useEffect(() => {
  // Track chat session start
  analytics.track('Chat Session Started', {
    sessionId,
    timestamp: new Date(),
  });
}, [sessionId]);
```

## Troubleshooting

### Issue: "GOOGLE_API_KEY is not configured"

**Solution**: Ensure `GOOGLE_API_KEY` is set in your `.env.local` file and restart the development server.

### Issue: Chat messages not saving

**Solution**:
1. Verify database migrations ran successfully
2. Check database connection string in `.env.local`
3. Check browser console for errors

### Issue: Subdomain not routing correctly

**Solution**:
1. Verify DNS records are configured correctly
2. Wait for DNS propagation (can take up to 48 hours)
3. Check middleware configuration in `/apps/web/src/middleware.ts`
4. Ensure middleware config matcher includes `'/'`

### Issue: AI responses are generic or incorrect

**Solution**:
1. Update `/apps/web/src/config/knowledge-base.ts` with your actual information
2. Restart the server to reload the knowledge base
3. Adjust AI temperature for more or less creativity

### Issue: CORS errors when accessing subdomain

**Solution**: Add CORS configuration in `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        // ... other headers
      ],
    },
  ];
}
```

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent API abuse
2. **Input Validation**: Message length is limited to 2000 characters
3. **API Key Security**: Never expose your GOOGLE_API_KEY in client-side code
4. **Session Management**: Sessions are stored in the database but visitor IDs are optional

## Cost Considerations

- **Gemini API**: Google Gemini has a free tier with generous limits
- **Database**: Each message and session takes minimal storage
- **Hosting**: Subdomain routing doesn't require additional server resources

## Next Steps

1. ✅ **Personalize** your knowledge base with accurate information
2. ✅ **Test** the chat thoroughly with various questions
3. ✅ **Monitor** chat sessions to understand visitor needs
4. ✅ **Iterate** on responses based on feedback
5. ✅ **Add** more features like file uploads, voice chat, etc.

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check server logs for API errors
3. Verify environment variables are set correctly
4. Ensure database migrations completed successfully

## Additional Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)

---

**Note**: Remember to update your knowledge base regularly to keep the AI assistant's responses current and accurate!
