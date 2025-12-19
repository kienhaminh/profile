'use server';

import * as cheerio from 'cheerio';
import { db } from '@/db/client';
import { historyEvents } from '@/db/schema';
import * as schema from '@/db/schema';

type CrawlResult = {
  success: boolean;
  message: string;
  count?: number;
};

export async function crawlHistory(url: string): Promise<CrawlResult> {
  try {
    console.log(`Starting crawl for: ${url}`);

    // 1. Fetch the HTML
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const html = await response.text();

    // 2. Load into Cheerio
    const $ = cheerio.load(html);
    const events: (typeof historyEvents.$inferInsert)[] = [];

    // 3. Parse logic (Specific to Wikipedia timeline pages for now)
    // Wikipedia timelines often use lists (ul > li) or tables.
    // Let's assume a standard timeline list format for "Lịch sử Việt Nam" based pages.
    // Example target: https://vi.wikipedia.org/wiki/Ni%C3%AAn_bi%E1%BB%83u_l%E1%BB%8Bch_s%E1%BB%AD_Vi%E1%BB%87t_Nam

    // Looking for lines like "Year: Event description"
    $('li').each((_, element) => {
      const text = $(element).text().trim();
      // Simple regex to catch starting years/dates.
      // Examples: "2000 TCN: ...", "Năm 938: ...", "2 tháng 9: ..."
      // This is a naive implementation and will need refinement based on actual HTML structure.

      const match = text.match(/^([\w\s\d,]+)[:|-]\s*(.+)/);
      if (match) {
        const timePart = match[1].trim();
        const contentPart = match[2].trim();

        // Try to extract a year number if possible for sorting
        const yearMatch = timePart.match(/\b(\d{3,4})\b/);
        const year = yearMatch ? parseInt(yearMatch[1]) : null;

        if (contentPart.length > 10) {
          // Filter out short noise
          events.push({
            title:
              contentPart.substring(0, 100) +
              (contentPart.length > 100 ? '...' : ''), // Title as summary
            description: contentPart,
            occurredAt: timePart,
            year: year,
            sourceUrl: url,
          });
        }
      }
    });

    console.log(`Found ${events.length} potential events.`);

    if (events.length === 0) {
      return {
        success: false,
        message:
          'No events found. The page structure might differ from expectation.',
      };
    }

    // 4. Batch insert into database
    // Drizzle doesn't support massive bulk inserts well in all drivers, but let's try a batch
    // or loop if needed. For 100s of items, single batch is usually fine.

    // Chunking to be safe
    const chunkSize = 50;
    for (let i = 0; i < events.length; i += chunkSize) {
      const chunk = events.slice(i, i + chunkSize);
      await db.insert(historyEvents).values(chunk);
    }

    return {
      success: true,
      message: `Successfully crawled and saved ${events.length} events.`,
      count: events.length,
    };
  } catch (error) {
    console.error('Crawl failed:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error during crawl',
    };
  }
}
