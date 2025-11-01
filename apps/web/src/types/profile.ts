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
  major: string;
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
