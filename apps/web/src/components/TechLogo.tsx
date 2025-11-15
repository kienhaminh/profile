import Image, { type StaticImageData } from 'next/image';
import { cn } from '@/lib/utils';

// Import all skill logos
import awsLogo from '@/assets/skill-logos/aws.svg';
import clerkLogo from '@/assets/skill-logos/clerk.svg';
import dockerLogo from '@/assets/skill-logos/docker.svg';
import firebaseLogo from '@/assets/skill-logos/firebase.svg';
import gitLogo from '@/assets/skill-logos/git.svg';
import javascriptLogo from '@/assets/skill-logos/javascript.svg';
import langchainLogo from '@/assets/skill-logos/langchain.svg';
import mongodbLogo from '@/assets/skill-logos/mongodb.svg';
import mysqlLogo from '@/assets/skill-logos/mysql.svg';
import nestjsLogo from '@/assets/skill-logos/nestjs.svg';
import nextauthLogo from '@/assets/skill-logos/nextauth.svg';
import nextjsLogo from '@/assets/skill-logos/nextjs.svg';
import postgresqlLogo from '@/assets/skill-logos/postgresql.svg';
import pythonLogo from '@/assets/skill-logos/python.svg';
import reactLogo from '@/assets/skill-logos/react.svg';
import redisLogo from '@/assets/skill-logos/redis.svg';
import supabaseLogo from '@/assets/skill-logos/supabase.svg';

interface TechLogoProps {
  name: string;
  className?: string;
}

const techLogoMap: Record<string, StaticImageData> = {
  // Languages
  JavaScript: javascriptLogo,
  Python: pythonLogo,

  // Frameworks
  ReactJS: reactLogo,
  NextJS: nextjsLogo,
  NestJS: nestjsLogo,
  LangChain: langchainLogo,

  // Services
  AWS: awsLogo,
  Docker: dockerLogo,
  Firebase: firebaseLogo,
  Git: gitLogo,
  Supabase: supabaseLogo,
  Clerk: clerkLogo,
  NextAuth: nextauthLogo,

  // Databases
  MongoDB: mongodbLogo,
  MySQL: mysqlLogo,
  PostgreSQL: postgresqlLogo,
  Redis: redisLogo,
};

export function TechLogo({ name, className }: TechLogoProps) {
  const logoPath = techLogoMap[name];

  if (!logoPath) {
    // Fallback to text if logo not found
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted rounded-lg font-semibold text-xs text-muted-foreground w-20 h-20 p-5',
          className
        )}
      >
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center bg-card rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="relative w-20 h-20">
        <Image
          src={logoPath}
          alt={`${name} logo`}
          fill
          className="object-contain"
          title={name}
        />
      </div>
    </div>
  );
}

export { techLogoMap };
