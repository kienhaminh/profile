import { z } from 'zod';

// Profile types for hardcoded personal information
export interface ContactInfo {
  address: string;
  mobile: string;
  email: string;
  facebook: string;
  linkedin: string;
  github: string;
}

export interface Education {
  period: string;
  institution: string;
  major?: string;
  gpa?: string;
  responsibilities?: string[];
}

export interface Experience {
  period: string;
  company: string;
  position: string;
  responsibilities: string[];
  recognition?: string[];
}

export interface Skills {
  language: string[];
  programmingLanguage: string[];
  framework: string[];
  service: string[];
  database: string[];
  other: string[];
}

// Zod schemas
export const contactInfoSchema = z.object({
  address: z.string(),
  mobile: z.string(),
  email: z.string().email(),
  facebook: z.string().url(),
  linkedin: z.string().url(),
  github: z.string().url(),
});

export const educationSchema = z.object({
  period: z.string(),
  institution: z.string(),
  major: z.string().optional(),
  gpa: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
});

export const experienceSchema = z.object({
  period: z.string(),
  company: z.string(),
  position: z.string(),
  responsibilities: z.array(z.string()),
  recognition: z.array(z.string()).optional(),
});

export const skillsSchema = z.object({
  language: z.array(z.string()),
  programmingLanguage: z.array(z.string()),
  framework: z.array(z.string()),
  service: z.array(z.string()),
  database: z.array(z.string()),
  other: z.array(z.string()),
});
