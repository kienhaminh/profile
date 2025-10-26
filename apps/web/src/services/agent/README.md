# Personal Agent with LangChain & LangGraph

A personal portfolio agent powered by LangChain and OpenAI, integrated with tRPC for type-safe access.

## Overview

The agent can answer questions about your blog posts and projects by:

1. Detecting keywords that indicate a need for portfolio data
2. Searching your blogs and projects database
3. Generating natural language responses using OpenAI's GPT-4

## Architecture

### Components

- **Types** (`@/types/agent.ts`): Zod schemas and TypeScript types for agent input/output
- **Service** (`@/services/agent/graph.ts`): Core agent logic with tool integration
- **Router** (`@/server/trpc/routers/agent.ts`): tRPC mutation for client access

### Flow

```
User Question
     ↓
Router Node (keyword detection)
     ↓
Tool Node (if needed) → Search blogs/projects
     ↓
Generate Node → OpenAI completion with context
     ↓
Response
```

## Setup

### 1. Environment Variable

Add to `.env.local`:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. Dependencies

Already installed:

- `@langchain/core`
- `@langchain/openai`
- `@langchain/langgraph`

## Usage

### Via tRPC

```typescript
import { trpc } from '@/trpc/react';

function ChatComponent() {
  const agentMutation = trpc.agent.respond.useMutation();

  const handleSubmit = async (message: string) => {
    const result = await agentMutation.mutateAsync({
      message,
      conversationHistory: [], // Optional: previous messages
    });

    console.log(result.text);
  };
}
```

### Direct Service Call

```typescript
import { runAgent } from '@/services/agent/graph';

const response = await runAgent({
  message: 'Tell me about your blog posts on TypeScript',
  conversationHistory: [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi! How can I help?' },
  ],
});
```

## Tools

### Blog Search Tool

- **Trigger keywords**: blog, article, post, write, written, read
- **Action**: Searches published blogs via `listBlogs` service
- **Returns**: Title, slug, excerpt, topics

### Project Search Tool

- **Trigger keywords**: project, portfolio, work, built, developed, created
- **Action**: Searches published projects via `listProjects` service
- **Returns**: Title, slug, description, technologies

## Configuration

### Model Settings

In `graph.ts`:

```typescript
const model = new ChatOpenAI({
  modelName: 'gpt-4o-mini', // Change model
  temperature: 0.7, // Adjust creativity (0-1)
  apiKey: process.env.OPENAI_API_KEY,
});
```

### System Prompt

Customize the assistant's behavior by editing the `systemPrompt` in `generateNode()`.

## Testing

Run unit tests:

```bash
pnpm test:run tests/unit/agent.test.ts
```

Tests cover:

- Input validation with Zod
- Keyword-based tool routing
- Response generation
- Error handling
- Conversation history

## Error Handling

- **Missing API Key**: Throws error immediately
- **Service Failures**: Tools catch and log errors, continue with empty context
- **Generation Failures**: Logged and thrown as descriptive errors

## Extending

### Add a New Tool

1. Define the tool function:

```typescript
const newTool = tool(
  async ({ query }: { query: string }) => {
    // Your logic here
    return 'Tool result';
  },
  {
    name: 'tool_name',
    description: 'What this tool does',
    schema: z.object({
      query: z.string(),
    }),
  }
);
```

2. Update router node keywords
3. Call tool in `toolNode()`

### Enable Streaming

Consider using tRPC subscriptions or Next.js Server Actions with streaming for real-time responses.

## Performance

- **Cold start**: ~2-3s (OpenAI API call + DB queries)
- **Warm**: ~1-2s
- **Caching**: Not implemented (each request is fresh)

## Security

- API key stored server-side only
- Public tRPC procedure (add auth if needed)
- Input validated with Zod before processing
- No PII or sensitive data in system prompts

## Future Enhancements

- [ ] Streaming responses
- [ ] Conversational memory (Redis/DB)
- [ ] RAG with blog content embeddings
- [ ] Multi-turn conversation state management
- [ ] Rate limiting per user
- [ ] Analytics/tracking

