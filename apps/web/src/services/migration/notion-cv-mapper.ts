import type { NewAuthorProfile, NewProject } from '@/db/schema';
import { generateSlug } from '@/lib/slug';

/**
 * Notion CV mapper - Parses Notion markdown to database entities
 * Extracts author profile and projects from Notion CV content
 */

interface ParsedProject {
  project: Omit<NewProject, 'id'>;
  technologyNames: string[];
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
  isOngoing: boolean;
}

/**
 * Parse date range strings like "Sep 2019 - Feb 2020" or "Jan 2021 - now"
 */
function parseDateRange(dateStr: string): DateRange {
  const trimmed = dateStr.trim();
  const parts = trimmed.split('-').map((p) => p.trim());

  if (parts.length !== 2) {
    return { startDate: null, endDate: null, isOngoing: false };
  }

  const [startStr, endStr] = parts;
  const isOngoing = endStr.toLowerCase() === 'now';

  // Parse start date
  const startDate = parseMonthYear(startStr);

  // Parse end date
  const endDate = isOngoing ? null : parseMonthYear(endStr);

  return { startDate, endDate, isOngoing };
}

/**
 * Parse month-year string like "Sep 2019" or "Feb 2020"
 */
function parseMonthYear(dateStr: string): Date | null {
  const months: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  const parts = dateStr.trim().split(/\s+/);
  if (parts.length !== 2) {
    return null;
  }

  const [monthStr, yearStr] = parts;
  const month = months[monthStr.toLowerCase()];
  const year = parseInt(yearStr, 10);

  if (month === undefined || isNaN(year)) {
    return null;
  }

  return new Date(year, month, 1);
}

/**
 * Extract technologies from a "Technologies used" line
 * Splits by comma and newline, trims, and deduplicates
 */
function extractTechnologies(techLine: string): string[] {
  const technologies: string[] = [];
  const items = techLine.split(/[,\n]/);

  for (const item of items) {
    const trimmed = item.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      technologies.push(trimmed);
    }
  }

  return technologies;
}

/**
 * Strip double curly braces from URLs (Notion format)
 */
function cleanUrl(url: string): string {
  return url.replace(/^\{\{|\}\}$/g, '').trim();
}

/**
 * Parse Notion CV markdown to author profile
 */
export function parseNotionCvToAuthor(notionMd: string): NewAuthorProfile {
  // Extract name from title
  const nameMatch = notionMd.match(
    /### Full Stack Developer[\s\S]*?\*\*Email\*\*:\s*([^\n]+)/
  );
  const emailMatch = notionMd.match(/\*\*Email\*\*:\s*([^\n]+)/);
  const imageMatch = notionMd.match(/<image source="([^"]+)"><\/image>/);

  // Extract About me section
  const aboutMatch = notionMd.match(
    /## About me[\s\S]*?---\s*([\s\S]*?)(?=\n##)/
  );
  let bio = '';
  if (aboutMatch) {
    const bullets = aboutMatch[1]
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.replace(/^-\s*/, '').trim())
      .filter(Boolean);
    bio = bullets.join(' ');
  }

  // Extract social links
  const addressMatch = notionMd.match(/\*\*Address\*\*:\s*([^\n]+)/);
  const mobileMatch = notionMd.match(/\*\*Mobile\*\*:\s*([^\n]+)/);
  const facebookMatch = notionMd.match(
    /\*\*Facebook\*\*:\s*\[([^\]]+)\]\(\{\{([^}]+)\}\}\)/
  );
  const linkedinMatch = notionMd.match(
    /\*\*LinkedIn\*\*:\s*\[([^\]]+)\]\(\{\{([^}]+)\}\}\)/
  );
  const githubMatch = notionMd.match(
    /\*\*Github\*\*:\s*\[([^\]]+)\]\(\{\{([^}]+)\}\}\)/
  );

  const socialLinks = {
    address: addressMatch ? addressMatch[1].trim() : '',
    mobile: mobileMatch ? mobileMatch[1].trim() : '',
    facebook: facebookMatch ? cleanUrl(facebookMatch[2]) : '',
    linkedin: linkedinMatch ? cleanUrl(linkedinMatch[2]) : '',
    github: githubMatch ? cleanUrl(githubMatch[2]) : '',
  };

  return {
    name: 'KIEN HA MINH',
    email: emailMatch ? emailMatch[1].trim() : 'minhkien2208@gmail.com',
    avatar: imageMatch ? cleanUrl(imageMatch[1]) : null,
    bio: bio || null,
    socialLinks,
  };
}

/**
 * Parse Notion CV markdown to projects
 */
export function parseNotionCvToProjects(notionMd: string): ParsedProject[] {
  const projects: ParsedProject[] = [];

  // Find the Projects section
  const projectsMatch = notionMd.match(/## Projects\s*---\s*([\s\S]+)$/);
  if (!projectsMatch) {
    return projects;
  }

  const projectsSection = projectsMatch[1];

  // Split by project headers (### or ---\n###)
  const projectBlocks = projectsSection.split(/(?=###\s+)|(?=---\s*\n###\s+)/);

  for (const block of projectBlocks) {
    if (!block.trim() || !block.includes('###')) {
      continue;
    }

    // Extract project title
    const titleMatch = block.match(/###\s+([^\n]+)/);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();

    // Extract date range
    const dateMatch = block.match(/\*([^*]+)\*/);
    const dateRange = dateMatch
      ? parseDateRange(dateMatch[1])
      : { startDate: null, endDate: null, isOngoing: false };

    // Extract description
    const descMatch = block.match(
      /\*\*Description[^*]*\*\*[\s\n]+<\/column>[\s\n]+<column>[\s\n]+([\s\S]*?)(?=\n\s*<\/column>)/
    );
    let description = '';
    if (descMatch) {
      description = descMatch[1]
        .split('\n')
        .map((line) => line.trim())
        .filter(
          (line) => line && !line.startsWith('<') && !line.startsWith('**')
        )
        .join(' ');
    }

    // Extract responsibilities
    const respMatch = block.match(
      /\*\*My responsibilities[^*]*\*\*[\s\n]+<\/column>[\s\n]+<column>[\s\n]+([\s\S]*?)(?=\n\s*<\/column>)/
    );
    if (respMatch) {
      const responsibilities = respMatch[1]
        .split('\n')
        .filter((line) => line.trim() && !line.trim().startsWith('<'))
        .map((line) => line.trim())
        .join(' ');
      if (responsibilities) {
        description += (description ? '. ' : '') + responsibilities;
      }
    }

    // Extract website URL
    const websiteMatch = block.match(
      /\*\*Website\*\*:\s*\[([^\]]+)\]\(\{\{([^}]+)\}\}\)/
    );
    const liveUrl = websiteMatch ? cleanUrl(websiteMatch[2]) : null;

    // Extract technologies - be more flexible with the match
    const techMatch = block.match(
      /\*\*Technologies used[^*]*\*\*[\s\n]+<\/column>[\s\n]+<column>[\s\n]+([\s\S]*?)(?=\n\s*(?:<\/column>|<columns>|###|$))/
    );
    const technologyNames = techMatch ? extractTechnologies(techMatch[1]) : [];

    const slug = generateSlug(title);

    projects.push({
      project: {
        title,
        slug,
        description: description || title,
        status: 'PUBLISHED',
        images: [],
        githubUrl: null,
        liveUrl,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        isOngoing: dateRange.isOngoing,
      },
      technologyNames,
    });
  }

  return projects;
}
