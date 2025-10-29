import { ChatOpenAI } from '@langchain/openai';
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import type { AgentInput } from '@/types/agent';
import { listBlogs } from '@/services/blog';
import { listProjects } from '@/services/project';
import { getRelatedBlogsBySlug } from '@/services/knowledge-graph';
import { logger } from '@/lib/logger';

interface AgentState {
  messages: Array<HumanMessage | AIMessage | SystemMessage>;
  toolContext: string;
  needsTool: boolean;
  userQuery: string;
}

const searchBlogsTool = tool(
  async ({ query }: { query: string }) => {
    try {
      logger.info('Agent searching blogs', { query });
      const result = await listBlogs({
        page: 1,
        limit: 5,
        status: 'PUBLISHED',
        search: query,
      });

      if (result.data.length === 0) {
        return 'No blogs found matching the query.';
      }

      const blogsText = result.data
        .map(
          (blog) =>
            `Title: ${blog.title}\nSlug: ${blog.slug}\nExcerpt: ${blog.excerpt || 'No excerpt'}\nTopics: ${blog.topics.map((t) => t.name).join(', ')}`
        )
        .join('\n\n');

      return `Found ${result.data.length} blog(s):\n\n${blogsText}`;
    } catch (error) {
      const errorInstance =
        error instanceof Error ? error : new Error('Unknown error');
      logger.error('Error searching blogs in agent tool', errorInstance);
      throw errorInstance;
    }
  },
  {
    name: 'search_blogs',
    description:
      'Search for blog posts by keywords. Use this when the user asks about blog posts, articles, or written content.',
    schema: z.object({
      query: z.string().describe('Search query for blog posts'),
    }),
  }
);

const searchProjectsTool = tool(
  async ({ query }: { query: string }) => {
    try {
      logger.info('Agent searching projects', { query });
      const result = await listProjects({
        page: 1,
        limit: 5,
        status: 'PUBLISHED',
        search: query,
      });

      if (result.data.length === 0) {
        return 'No projects found matching the query.';
      }

      const projectsText = result.data
        .map(
          (project) =>
            `Title: ${project.title}\nSlug: ${project.slug}\nDescription: ${project.description || 'No description'}\nTechnologies: ${project.technologies.map((t) => t.name).join(', ')}`
        )
        .join('\n\n');

      return `Found ${result.data.length} project(s):\n\n${projectsText}`;
    } catch (error) {
      const errorInstance =
        error instanceof Error ? error : new Error('Unknown error');
      logger.error('Error searching projects in agent tool', errorInstance);
      throw errorInstance;
    }
  },
  {
    name: 'search_projects',
    description:
      'Search for projects by keywords. Use this when the user asks about projects, portfolio work, or technical implementations.',
    schema: z.object({
      query: z.string().describe('Search query for projects'),
    }),
  }
);

const relatedBlogsTool = tool(
  async ({ query }: { query: string }) => {
    try {
      logger.info('Agent finding related blogs', { query });
      const result = await listBlogs({
        page: 1,
        limit: 1,
        status: 'PUBLISHED',
        search: query,
      });

      if (result.data.length === 0) {
        return 'No matching blog found to compute related posts.';
      }

      const targetBlog = result.data[0];
      const relatedBlogs = await getRelatedBlogsBySlug(targetBlog.slug, 5);

      if (relatedBlogs.length === 0) {
        return `Found the blog "${targetBlog.title}" but no related posts were found.`;
      }

      const relatedText = relatedBlogs
        .map(
          (blog) =>
            `- ${blog.title} (/blog/${blog.slug}) [relevance score: ${blog.score}]`
        )
        .join('\n');

      return `Related to "${targetBlog.title}":\n\n${relatedText}`;
    } catch (error) {
      const errorInstance =
        error instanceof Error ? error : new Error('Unknown error');
      logger.error('Error finding related blogs in agent tool', errorInstance);
      throw errorInstance;
    }
  },
  {
    name: 'related_blogs',
    description:
      'Find blog posts related to a specific post. Use this when the user asks about similar posts, related content, or what else to read.',
    schema: z.object({
      query: z
        .string()
        .describe('Blog post title or keywords to find related content for'),
    }),
  }
);

function routerNode(state: AgentState): Partial<AgentState> {
  const query = state.userQuery.toLowerCase();

  const blogKeywords = ['blog', 'article', 'post', 'write', 'written', 'read'];
  const projectKeywords = [
    'project',
    'portfolio',
    'work',
    'built',
    'developed',
    'created',
  ];
  const relatedKeywords = [
    'related',
    'similar',
    'like',
    'also read',
    'more about',
  ];

  const needsBlogTool = blogKeywords.some((kw) => query.includes(kw));
  const needsProjectTool = projectKeywords.some((kw) => query.includes(kw));
  const needsRelatedTool = relatedKeywords.some((kw) => query.includes(kw));

  return {
    needsTool: needsBlogTool || needsProjectTool || needsRelatedTool,
  };
}

async function toolNode(state: AgentState): Promise<Partial<AgentState>> {
  try {
    const query = state.userQuery;
    const queryLower = query.toLowerCase();

    let context = '';

    const blogKeywords = [
      'blog',
      'article',
      'post',
      'write',
      'written',
      'read',
    ];
    const projectKeywords = [
      'project',
      'portfolio',
      'work',
      'built',
      'developed',
      'created',
    ];
    const relatedKeywords = [
      'related',
      'similar',
      'like',
      'also read',
      'more about',
    ];

    const needsBlogTool = blogKeywords.some((kw) => queryLower.includes(kw));
    const needsProjectTool = projectKeywords.some((kw) =>
      queryLower.includes(kw)
    );
    const needsRelatedTool = relatedKeywords.some((kw) =>
      queryLower.includes(kw)
    );

    if (needsRelatedTool && needsBlogTool) {
      // User is asking for related blogs
      const relatedResult = await relatedBlogsTool.invoke({ query });
      context += `Related Blog Posts:\n${relatedResult}\n\n`;
    } else if (needsBlogTool) {
      const blogResult = await searchBlogsTool.invoke({ query });
      context += `Blog Search Results:\n${blogResult}\n\n`;
    }

    if (needsProjectTool) {
      const projectResult = await searchProjectsTool.invoke({ query });
      context += `Project Search Results:\n${projectResult}\n\n`;
    }

    if (!context) {
      context = 'No specific data retrieved.';
    }

    return {
      toolContext: context.trim(),
    };
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error('Unknown error');
    logger.error('Error in tool node', errorInstance);
    return {
      toolContext: 'Error retrieving information from the portfolio database.',
    };
  }
}

async function generateNode(state: AgentState): Promise<Partial<AgentState>> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `You are a helpful personal assistant for a developer's portfolio website. You can answer questions about the developer's blog posts and projects.

${state.toolContext ? `Here is relevant information from the portfolio:\n\n${state.toolContext}` : ''}

Be concise, friendly, and professional. If you don't have enough information to answer accurately, say so politely.`;

    const messages = [
      new SystemMessage(systemPrompt),
      ...state.messages,
      new HumanMessage(state.userQuery),
    ];

    const response = await model.invoke(messages);

    return {
      messages: [...state.messages, new AIMessage(response.content.toString())],
    };
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error('Unknown error');
    logger.error('Error in generate node', errorInstance);
    throw errorInstance;
  }
}

async function executeGraph(state: AgentState): Promise<AgentState> {
  // Step 1: Router - decide if tools are needed
  const routerResult = routerNode(state);
  const needsTool = routerResult.needsTool ?? false;

  let toolContext = '';

  // Step 2: Conditionally run tool node
  if (needsTool) {
    const toolResult = await toolNode({
      ...state,
      needsTool,
    });
    toolContext = toolResult.toolContext ?? '';
  }

  // Step 3: Generate response
  const generateResult = await generateNode({
    ...state,
    needsTool,
    toolContext,
  });

  return {
    ...state,
    ...generateResult,
    toolContext,
    needsTool,
  };
}

export async function runAgent(input: AgentInput): Promise<string> {
  try {
    logger.info('Running agent', { messageLength: input.message.length });

    const initialState: AgentState = {
      messages: input.conversationHistory
        ? input.conversationHistory.map((msg) => {
            if (msg.role === 'user') {
              return new HumanMessage(msg.content);
            } else if (msg.role === 'assistant') {
              return new AIMessage(msg.content);
            } else {
              return new SystemMessage(msg.content);
            }
          })
        : [],
      toolContext: '',
      needsTool: false,
      userQuery: input.message,
    };

    const finalState = await executeGraph(initialState);

    const lastMessage = finalState.messages[finalState.messages.length - 1];
    const response =
      lastMessage && 'content' in lastMessage
        ? lastMessage.content.toString()
        : 'I apologize, but I was unable to generate a response.';

    logger.info('Agent completed successfully', {
      responseLength: response.length,
    });

    return response;
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error('Unknown error');
    logger.error('Error running agent', errorInstance);
    throw new Error(`Agent execution failed: ${errorInstance.message}`);
  }
}
