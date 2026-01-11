/**
 * Knowledge Base Configuration
 * This file contains information about you that the AI will use to answer visitor questions.
 * Update this file with your personal information, skills, experience, and preferences.
 */

export const knowledgeBase = {
  personal: {
    name: 'Kien Ha',
    role: 'Full Stack Developer',
    location: 'Add your location',
    email: 'contact@kienha.online',
    website: 'https://kienha.online',
    bio: 'A passionate developer specializing in building modern web applications with cutting-edge technologies.',
  },

  skills: {
    languages: ['TypeScript', 'JavaScript', 'Python', 'Go', 'SQL'],
    frontend: ['React', 'Next.js', 'Tailwind CSS', 'shadcn/ui', 'tRPC'],
    backend: ['Node.js', 'tRPC', 'Drizzle ORM', 'PostgreSQL', 'REST APIs'],
    tools: ['Git', 'Docker', 'Vercel', 'Supabase', 'Turbo'],
  },

  experience: [
    {
      title: 'Add your job title',
      company: 'Add company name',
      duration: 'Start Date - End Date (or Present)',
      description: 'Add description of your role and achievements',
      technologies: ['Tech1', 'Tech2', 'Tech3'],
    },
    // Add more experiences as needed
  ],

  projects: {
    highlighted: [
      {
        name: 'Portfolio Website',
        description:
          'A modern portfolio website built with Next.js 15, tRPC, and PostgreSQL',
        technologies: ['Next.js', 'tRPC', 'PostgreSQL', 'Tailwind CSS'],
        url: 'https://kienha.online',
        achievements: [
          'Built with latest Next.js 15 and App Router',
          'Type-safe API with tRPC',
          'Full blog and project management system',
        ],
      },
      // Add more projects
    ],
  },

  services: {
    available: [
      'Full-stack web development',
      'API development and integration',
      'Database design and optimization',
      'Modern UI/UX implementation',
      'Technical consulting',
    ],
    process:
      'I follow an agile development process with regular communication and iterative delivery.',
  },

  education: [
    {
      degree: 'Add your degree',
      institution: 'Add institution name',
      year: 'Graduation year',
    },
    // Add more education entries
  ],

  interests: [
    'Web Development',
    'Open Source',
    'AI/ML',
    'DevOps',
    // Add your interests
  ],

  availability: {
    status: 'Available for freelance work',
    preferredContactMethod: 'Email or through the contact form on my website',
    responseTime: 'Usually within 24 hours',
  },

  social: {
    github: 'Add your GitHub username',
    linkedin: 'Add your LinkedIn profile URL',
    x: 'Add your X (formerly Twitter) handle (optional)',
    youtube: 'Add your YouTube channel URL (optional)',
    tiktok: 'Add your TikTok profile URL (optional)',
  },

  faq: [
    {
      question: 'What technologies do you specialize in?',
      answer:
        'I specialize in modern full-stack development with TypeScript, React, Next.js, tRPC, and PostgreSQL.',
    },
    {
      question: 'Are you available for freelance work?',
      answer:
        'Yes, I am available for freelance projects. Please reach out through the contact form or email.',
    },
    {
      question: 'What is your typical project timeline?',
      answer:
        'Project timelines vary based on scope and complexity. I provide detailed estimates after understanding requirements.',
    },
    // Add more FAQs
  ],
};

/**
 * Generate a comprehensive context string for the AI
 * This formats the knowledge base into a readable format for the AI model
 */
export function getAIContext(): string {
  const kb = knowledgeBase;

  return `
You are an AI assistant representing ${kb.personal.name}, ${kb.personal.role}.

PERSONAL INFORMATION:
- Name: ${kb.personal.name}
- Role: ${kb.personal.role}
- Location: ${kb.personal.location}
- Email: ${kb.personal.email}
- Website: ${kb.personal.website}
- Bio: ${kb.personal.bio}

TECHNICAL SKILLS:
Languages: ${kb.skills.languages.join(', ')}
Frontend: ${kb.skills.frontend.join(', ')}
Backend: ${kb.skills.backend.join(', ')}
Tools & Platforms: ${kb.skills.tools.join(', ')}

EXPERIENCE:
${kb.experience
  .map(
    (exp) => `
- ${exp.title} at ${exp.company} (${exp.duration})
  ${exp.description}
  Technologies: ${exp.technologies.join(', ')}
`
  )
  .join('\n')}

HIGHLIGHTED PROJECTS:
${kb.projects.highlighted
  .map(
    (proj) => `
- ${proj.name}
  ${proj.description}
  Technologies: ${proj.technologies.join(', ')}
  ${proj.url ? `URL: ${proj.url}` : ''}
  Key achievements:
  ${proj.achievements.map((a) => `  * ${a}`).join('\n')}
`
  )
  .join('\n')}

SERVICES OFFERED:
${kb.services.available.map((s) => `- ${s}`).join('\n')}

Process: ${kb.services.process}

EDUCATION:
${kb.education.map((edu) => `- ${edu.degree}, ${edu.institution} (${edu.year})`).join('\n')}

INTERESTS:
${kb.interests.map((i) => `- ${i}`).join('\n')}

AVAILABILITY:
Status: ${kb.availability.status}
Contact: ${kb.availability.preferredContactMethod}
Response Time: ${kb.availability.responseTime}

SOCIAL LINKS:
- GitHub: ${kb.social.github}
- LinkedIn: ${kb.social.linkedin}
${kb.social.x ? `- X (formerly Twitter): ${kb.social.x}` : ''}
${kb.social.youtube ? `- YouTube: ${kb.social.youtube}` : ''}
${kb.social.tiktok ? `- TikTok: ${kb.social.tiktok}` : ''}

FREQUENTLY ASKED QUESTIONS:
${kb.faq
  .map(
    (q) => `
Q: ${q.question}
A: ${q.answer}
`
  )
  .join('\n')}

INSTRUCTIONS:
1. Answer questions about ${kb.personal.name}'s background, skills, experience, and services professionally
2. Be conversational but professional
3. If you don't have specific information, acknowledge it and suggest contacting directly
4. Encourage visitors to reach out for collaboration or project inquiries
5. Highlight relevant projects and experience based on the visitor's questions
6. Keep responses concise but informative
7. Use a friendly and approachable tone
`;
}
