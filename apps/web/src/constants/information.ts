import type {
  ContactInfo,
  Education,
  Experience,
  Skills,
} from '@/types/profile';

// Contact information with environment variable support and fallbacks
// Uses NEXT_PUBLIC_ prefixed variables for client-safe values

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (basic international format)
function isValidPhone(phone: string): boolean {
  // Allow various international formats: +countrycode number
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

const rawEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'minhkien2208@gmail.com';
const rawPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+84776978875';
const rawAddress =
  process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'Danang City, Vietnam';
const rawName = process.env.NEXT_PUBLIC_CONTACT_NAME || 'Ha Minh Kien';
const rawShortName = process.env.NEXT_PUBLIC_CONTACT_SHORT_NAME || 'Kien Ha';

// Validate and provide fallbacks for critical fields
const email = isValidEmail(rawEmail) ? rawEmail : 'contact@example.com';
const phone = isValidPhone(rawPhone) ? rawPhone : '+1234567890';
const address = rawAddress.trim() || 'Location not specified';
const name = rawName.trim() || 'Name not specified';
const shortName = rawShortName.trim() || 'User';

export const INFORMATION = {
  shortName,
  name,
  email,
  phone,
  address,
  title:
    process.env.NEXT_PUBLIC_SITE_TITLE ||
    'Full-stack Developer & AI Researcher',
  bio:
    process.env.NEXT_PUBLIC_SITE_BIO ||
    'Full-stack developer specializing in modern web technologies and AI integration. Building scalable applications with React, Next.js, TypeScript, and Python. Currently pursuing research in AI applications for medical field.',
  socialLinks: {
    github: process.env.NEXT_PUBLIC_GITHUB || 'https://github.com/kienhaminh',
    linkedin:
      process.env.NEXT_PUBLIC_LINKEDIN || 'http://linkedin.com/in/haminhkien',
    facebook:
      process.env.NEXT_PUBLIC_FACEBOOK ||
      'https://www.facebook.com/haminh.kien',
    twitter: process.env.NEXT_PUBLIC_TWITTER || '',
  },
  // Academic & Research Profiles
  academicProfiles: {
    googleScholar: '', // Add your Google Scholar profile URL
    researchGate: '', // Add your ResearchGate profile URL
    orcid: '', // Add your ORCID URL
  },
  // Organization/Institution
  organization: {
    name: 'NAPA GLOBAL',
    type: 'company' as const, // 'company' | 'university' | 'research-institution'
  },
  // Academic Credentials
  currentInstitution: {
    name: 'Chonnam National University',
    department: 'Department of AI Convergence',
    degree: "Master's Student",
  },
  alumniOf: {
    name: 'Danang University of Education',
    degree: 'Bachelor of Information Technology',
  },
} as const;

// Export validation status for debugging/logging
export const INFORMATION_VALIDATION = {
  emailValid: isValidEmail(rawEmail),
  phoneValid: isValidPhone(rawPhone),
  addressValid: rawAddress.trim() !== '',
  nameValid: rawName.trim() !== '',
  shortNameValid: rawShortName.trim() !== '',
} as const;

// Profile contact information
export const CONTACT: ContactInfo = {
  address: 'K12/08 Hoang Van Thai Street, Danang',
  mobile: '0776978875',
  email: 'minhkien2208@gmail.com',
  facebook: 'https://www.facebook.com/haminh.kien',
  linkedin: 'http://linkedin.com/in/haminhkien',
  github: 'https://github.com/kienhaminh',
};

// Education history
export const EDUCATION: Education[] = [
  {
    period: 'Sep 2016 - May 2020',
    institution: 'DANANG UNIVERSITY OF EDUCATION',
    major: 'Information Technology',
    gpa: '3.49/4',
  },
  {
    period: 'Aug 2025 - now',
    institution: 'CHONNAM NATIONAL UNIVERSITY - KOREA',
    major: "Master's Student in Department of AI Convergence",
    responsibilities: [
      'Research on applying AI to medical field.',
      'Drug, Alzheimer, Brain age prediction topic.',
    ],
  },
];

// Work experience
export const EXPERIENCE: Experience[] = [
  {
    period: 'Sep 2019 - Jul 2025',
    company: 'NAPA GLOBAL',
    position: 'Senior Full-stack Developer & Technical Lead',
    responsibilities: [
      'Led development of scalable web/mobile apps using Next.js, React Native, and Node.js microservices.',
      'Architected secure, high-availability cloud infrastructure on AWS.',
      'Modernized engineering with CI/CD (GitLab/GitHub) and AI-driven workflows.',
      'Mentored developers and fostered a collaborative, high-performance team culture.',
    ],
    recognition: ['Outstanding Staff Award (2019)', 'Culture Champion (2021)'],
  },
];

// Skills
export const SKILLS: Skills = {
  language: ['English'],
  programmingLanguage: ['JavaScript', 'Python'],
  framework: ['ReactJS', 'NextJS', 'NestJS', 'LangChain'],
  service: [
    'AWS',
    'Docker',
    'Firebase',
    'Git',
    'Supabase',
    'Clerk',
    'NextAuth',
  ],
  database: ['MongoDB', 'MySQL', 'PostgreSQL', 'Redis'],
  other: [
    'Automation Test',
    'CD/CD with Github/Gitlab',
    'GraphQL',
    'Third-party integration such as Slack, LinkedIn, Telegram',
  ],
};
