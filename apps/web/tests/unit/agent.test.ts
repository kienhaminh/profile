import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { agentInputSchema } from '@/types/agent';
import { runAgent } from '@/services/agent/graph';

const mocks = vi.hoisted(() => {
  const listBlogsMock = vi.fn();
  const listProjectsMock = vi.fn();
  const chatInvokeMock = vi.fn();
  const chatConstructorMock = vi.fn(() => ({
    invoke: chatInvokeMock,
  }));
  const loggerMock = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  };

  return {
    listBlogsMock,
    listProjectsMock,
    chatInvokeMock,
    chatConstructorMock,
    loggerMock,
  };
});

const {
  listBlogsMock,
  listProjectsMock,
  chatInvokeMock,
  chatConstructorMock,
  loggerMock,
} = mocks;

const defaultBlogImplementation = async ({
  search,
}: {
  search: string;
}) => {
  if (search.toLowerCase().includes('typescript')) {
    return {
      data: [
        {
          id: '1',
          title: 'TypeScript Best Practices',
          slug: 'typescript-best-practices',
          excerpt: 'Learn the best practices for TypeScript development',
          topics: [{ name: 'TypeScript' }, { name: 'Programming' }],
        },
      ],
      pagination: { page: 1, limit: 5, total: 1, totalPages: 1 },
    };
  }

  return {
    data: [],
    pagination: { page: 1, limit: 5, total: 0, totalPages: 0 },
  };
};

const defaultProjectImplementation = async ({
  search,
}: {
  search: string;
}) => {
  if (search.toLowerCase().includes('portfolio')) {
    return {
      data: [
        {
          id: '1',
          title: 'Personal Portfolio Website',
          slug: 'personal-portfolio',
          description: 'A modern portfolio built with Next.js',
          technologies: [{ name: 'Next.js' }, { name: 'TypeScript' }],
        },
      ],
      pagination: { page: 1, limit: 5, total: 1, totalPages: 1 },
    };
  }

  return {
    data: [],
    pagination: { page: 1, limit: 5, total: 0, totalPages: 0 },
  };
};

const defaultChatInvokeImplementation = async (messages: any[]) => {
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage?.content ?? lastMessage?.text ?? '';

  return {
    content: `This is a mock response about: ${content
      .toString()
      .substring(0, 50)}`,
  };
};

const resetMocksToDefaults = () => {
  listBlogsMock.mockImplementation(defaultBlogImplementation);
  listProjectsMock.mockImplementation(defaultProjectImplementation);
  chatConstructorMock.mockImplementation(() => ({
    invoke: chatInvokeMock,
  }));
  chatInvokeMock.mockImplementation(defaultChatInvokeImplementation);
};

vi.mock('@/services/blog', () => ({
  listBlogs: mocks.listBlogsMock,
}));

vi.mock('@/services/project', () => ({
  listProjects: mocks.listProjectsMock,
}));

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: mocks.chatConstructorMock,
}));

vi.mock('@/lib/logger', () => ({
  logger: mocks.loggerMock,
}));

describe('Agent Types and Validation', () => {
  describe('agentInputSchema', () => {
    it('should validate correct input', () => {
      const validInput = {
        message: 'Hello, agent!',
        conversationHistory: [],
      };

      const result = agentInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject empty message', () => {
      const invalidInput = {
        message: '',
        conversationHistory: [],
      };

      const result = agentInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject message that is too long', () => {
      const invalidInput = {
        message: 'a'.repeat(1001),
        conversationHistory: [],
      };

      const result = agentInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should default conversationHistory to empty array if not provided', () => {
      const input = {
        message: 'Hello',
      };

      const result = agentInputSchema.parse(input);
      expect(result.conversationHistory).toEqual([]);
    });

    it('should validate conversation history messages', () => {
      const validInput = {
        message: 'Hello',
        conversationHistory: [
          { role: 'user' as const, content: 'Previous question' },
          { role: 'assistant' as const, content: 'Previous answer' },
        ],
      };

      const result = agentInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role in conversation history', () => {
      const invalidInput = {
        message: 'Hello',
        conversationHistory: [
          { role: 'invalid_role', content: 'Some content' },
        ],
      };

      const result = agentInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject empty content in conversation history', () => {
      const invalidInput = {
        message: 'Hello',
        conversationHistory: [{ role: 'user' as const, content: '' }],
      };

      const result = agentInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});

describe('Agent Graph Execution', () => {
  const originalEnv = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-api-key';
    vi.clearAllMocks();
    resetMocksToDefaults();
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalEnv;
  });

  it('should return a non-empty string response', async () => {
    const input = {
      message: 'Tell me about your work',
      conversationHistory: [],
    };

    const response = await runAgent(input);

    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('should handle questions about blogs', async () => {
    const input = {
      message: 'Tell me about your blog posts on typescript',
      conversationHistory: [],
    };

    const response = await runAgent(input);

    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('should handle questions about projects', async () => {
    const input = {
      message: 'Show me your portfolio projects',
      conversationHistory: [],
    };

    const response = await runAgent(input);

    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('should handle general questions without tools', async () => {
    const input = {
      message: 'What is your favorite programming language?',
      conversationHistory: [],
    };

    const response = await runAgent(input);

    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('should handle conversation history', async () => {
    const input = {
      message: 'Tell me more',
      conversationHistory: [
        { role: 'user' as const, content: 'What projects have you built?' },
        {
          role: 'assistant' as const,
          content:
            'I have built several projects including a portfolio website.',
        },
      ],
    };

    const response = await runAgent(input);

    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('should throw error when OPENAI_API_KEY is not set', async () => {
    delete process.env.OPENAI_API_KEY;

    const input = {
      message: 'Hello',
      conversationHistory: [],
    };

    await expect(runAgent(input)).rejects.toThrow();
  });

  it('should handle keywords that trigger blog tool', async () => {
    const keywords = ['blog', 'article', 'post', 'write', 'written', 'read'];

    for (const keyword of keywords) {
      const input = {
        message: `Tell me about your ${keyword}`,
        conversationHistory: [],
      };

      const response = await runAgent(input);
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    }
  });

  it('should handle keywords that trigger project tool', async () => {
    const keywords = [
      'project',
      'portfolio',
      'work',
      'built',
      'developed',
      'created',
    ];

    for (const keyword of keywords) {
      const input = {
        message: `Show me what you ${keyword}`,
        conversationHistory: [],
      };

      const response = await runAgent(input);
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    }
  });

  it('should handle mixed case in keywords', async () => {
    const input = {
      message: 'Tell me about your BLOG posts',
      conversationHistory: [],
    };

    const response = await runAgent(input);

    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('should handle long messages within limit', async () => {
    const input = {
      message: 'a'.repeat(500) + ' Tell me about your projects',
      conversationHistory: [],
    };

    const response = await runAgent(input);

    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('should pass blog tool context into the system prompt', async () => {
    const input = {
      message: 'Can you summarize your TypeScript blog?',
      conversationHistory: [],
    };

    await runAgent(input);

    expect(listBlogsMock).toHaveBeenCalledWith({
      page: 1,
      limit: 5,
      status: 'PUBLISHED',
      search: input.message,
    });

    const [[messages]] = chatInvokeMock.mock.calls;
    const systemPrompt = messages[0]?.content ?? '';
    expect(systemPrompt).toContain('Blog Search Results:');
    expect(systemPrompt).toContain('TypeScript Best Practices');
  });

  it('should pass project tool context into the system prompt', async () => {
    const input = {
      message: 'Show me your PORTFOLIO achievements',
      conversationHistory: [],
    };

    await runAgent(input);

    expect(listProjectsMock).toHaveBeenCalledWith({
      page: 1,
      limit: 5,
      status: 'PUBLISHED',
      search: input.message,
    });

    const [[messages]] = chatInvokeMock.mock.calls;
    const systemPrompt = messages[0]?.content ?? '';
    expect(systemPrompt).toContain('Project Search Results:');
    expect(systemPrompt).toContain('Personal Portfolio Website');
  });

  it('should continue with fallback context when a tool fails', async () => {
    listProjectsMock.mockRejectedValueOnce(new Error('Database offline'));

    const input = {
      message: 'Tell me about your portfolio',
      conversationHistory: [],
    };

    const response = await runAgent(input);

    expect(typeof response).toBe('string');

    const [[messages]] = chatInvokeMock.mock.calls;
    const systemPrompt = messages[0]?.content ?? '';
    expect(systemPrompt).toContain(
      'Error retrieving information from the portfolio database.'
    );
    expect(loggerMock.error).toHaveBeenCalledWith(
      'Error in tool node',
      expect.any(Error)
    );
  });
});

describe('Agent Error Handling', () => {
  const originalEnv = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-api-key';
    vi.clearAllMocks();
    resetMocksToDefaults();
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalEnv;
    vi.clearAllMocks();
  });

  it('should throw descriptive error on failure', async () => {
    delete process.env.OPENAI_API_KEY;

    const input = {
      message: 'Hello',
      conversationHistory: [],
    };

    await expect(runAgent(input)).rejects.toThrow(/Agent execution failed/);
  });

  it('should validate input before execution', () => {
    const invalidInputs = [{ message: '' }, { message: 'a'.repeat(1001) }];

    for (const input of invalidInputs) {
      const result = agentInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    }
  });
});

