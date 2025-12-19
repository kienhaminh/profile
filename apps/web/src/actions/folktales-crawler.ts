'use server';

import * as cheerio from 'cheerio';
import { db } from '@/db/client';
import { folktales } from '@/db/schema';

type CrawlResult = {
  success: boolean;
  message: string;
  count?: number;
  stories?: { title: string; summary: string }[];
};

// Default keywords for Vietnamese folktales
const FOLKTALE_KEYWORDS = [
  'truyện cổ tích Việt Nam',
  'truyện dân gian Việt Nam',
  'truyền thuyết Việt Nam',
  'truyện ngụ ngôn Việt Nam',
];

// Known folktale list pages to crawl
const FOLKTALE_SOURCES = [
  {
    name: 'Wikipedia Vietnamese Folktales List',
    url: 'https://vi.wikipedia.org/wiki/Danh_s%C3%A1ch_truy%E1%BB%87n_c%E1%BB%95_t%C3%ADch_Vi%E1%BB%87t_Nam',
    type: 'list',
  },
  {
    name: 'Wikipedia Vietnamese Legends',
    url: 'https://vi.wikipedia.org/wiki/Truy%E1%BB%81n_thuy%E1%BA%BFt_Vi%E1%BB%87t_Nam',
    type: 'article',
  },
];

/**
 * Crawl folktales from Wikipedia folktale list page.
 * Extracts story titles and links, then fetches each story's content.
 */
export async function crawlFolktales(): Promise<CrawlResult> {
  try {
    console.log('Starting Vietnamese folktales crawl...');
    const allStories: (typeof folktales.$inferInsert)[] = [];

    // Start with the main list page
    const listUrl = FOLKTALE_SOURCES[0].url;
    console.log(`Fetching list from: ${listUrl}`);

    const response = await fetch(listUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Wikipedia list pages typically have links in list items
    // Look for links to individual story pages
    const storyLinks: { title: string; url: string }[] = [];

    // Find links within the main content area
    $('#mw-content-text ul li a').each((_, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const title = $link.text().trim();

      // Filter for actual story links (skip edit links, category links, etc.)
      if (
        href &&
        href.startsWith('/wiki/') &&
        !href.includes(':') &&
        !href.includes('#') &&
        title.length > 3
      ) {
        storyLinks.push({
          title,
          url: `https://vi.wikipedia.org${href}`,
        });
      }
    });

    console.log(`Found ${storyLinks.length} potential story links.`);

    // Limit to first 20 stories to avoid too many requests
    const limitedLinks = storyLinks.slice(0, 20);

    // Fetch each story's content
    for (const link of limitedLinks) {
      try {
        console.log(`Fetching story: ${link.title}`);
        const storyHtml = await fetchWithDelay(link.url, 500);
        const story$ = cheerio.load(storyHtml);

        // Get the first few paragraphs as summary
        const paragraphs: string[] = [];
        story$('#mw-content-text p').each((i, el) => {
          if (i < 3) {
            const text = story$(el).text().trim();
            if (text.length > 50) {
              paragraphs.push(text);
            }
          }
        });

        const summary = paragraphs.join('\n\n').substring(0, 1000);

        // Get full content from all paragraphs
        const fullContent: string[] = [];
        story$('#mw-content-text p').each((_, el) => {
          const text = story$(el).text().trim();
          if (text.length > 30) {
            fullContent.push(text);
          }
        });

        if (summary.length > 100) {
          allStories.push({
            title: link.title,
            content: fullContent.join('\n\n'),
            summary: summary,
            category: 'fairy_tale',
            sourceUrl: link.url,
            characters: [],
          });
        }
      } catch (err) {
        console.warn(`Failed to fetch story ${link.title}:`, err);
      }
    }

    console.log(`Successfully parsed ${allStories.length} stories.`);

    if (allStories.length === 0) {
      return {
        success: false,
        message: 'No stories found. The page structure might have changed.',
      };
    }

    // Insert into database in chunks
    const chunkSize = 10;
    for (let i = 0; i < allStories.length; i += chunkSize) {
      const chunk = allStories.slice(i, i + chunkSize);
      await db.insert(folktales).values(chunk);
    }

    return {
      success: true,
      message: `Successfully crawled and saved ${allStories.length} folktales.`,
      count: allStories.length,
      stories: allStories.map((s) => ({
        title: s.title!,
        summary: s.summary?.substring(0, 100) || '',
      })),
    };
  } catch (error) {
    console.error('Folktales crawl failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Search-based crawl using keywords
 */
export async function searchFolktales(keyword: string): Promise<CrawlResult> {
  try {
    // Use Wikipedia search API
    const searchUrl = `https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(keyword)}&format=json&origin=*`;

    console.log(`Searching Wikipedia for: ${keyword}`);
    const response = await fetch(searchUrl);
    const data = await response.json();

    const results = data.query?.search || [];
    console.log(`Found ${results.length} search results.`);

    const stories: (typeof folktales.$inferInsert)[] = [];

    for (const result of results.slice(0, 10)) {
      const pageUrl = `https://vi.wikipedia.org/wiki/${encodeURIComponent(result.title)}`;

      try {
        const pageHtml = await fetchWithDelay(pageUrl, 500);
        const $ = cheerio.load(pageHtml);

        const paragraphs: string[] = [];
        $('#mw-content-text p').each((i, el) => {
          if (i < 5) {
            const text = $(el).text().trim();
            if (text.length > 50) {
              paragraphs.push(text);
            }
          }
        });

        const content = paragraphs.join('\n\n');
        if (content.length > 200) {
          stories.push({
            title: result.title,
            content: content,
            summary: content.substring(0, 500),
            category: 'fairy_tale',
            sourceUrl: pageUrl,
            characters: [],
          });
        }
      } catch (err) {
        console.warn(`Failed to fetch ${result.title}:`, err);
      }
    }

    if (stories.length > 0) {
      const chunkSize = 10;
      for (let i = 0; i < stories.length; i += chunkSize) {
        const chunk = stories.slice(i, i + chunkSize);
        await db.insert(folktales).values(chunk);
      }
    }

    return {
      success: true,
      message: `Found and saved ${stories.length} stories for keyword "${keyword}".`,
      count: stories.length,
      stories: stories.map((s) => ({
        title: s.title!,
        summary: s.summary?.substring(0, 100) || '',
      })),
    };
  } catch (error) {
    console.error('Search crawl failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function fetchWithDelay(url: string, delayMs: number): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}
