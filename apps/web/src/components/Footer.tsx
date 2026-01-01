import type { JSX } from 'react';
import Link from 'next/link';
import { INFORMATION, CONTACT } from '@/constants/information';
import { Github, Linkedin, Mail, Facebook } from 'lucide-react';

/**
 * Footer - Minimal footer following the modern design aesthetic.
 * Clean layout with copyright and social links.
 */
export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-border py-12" role="contentinfo">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {INFORMATION.name}. All rights
            reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <Link
              href={CONTACT.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href={CONTACT.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link
              href={CONTACT.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </Link>
            <Link
              href={`mailto:${CONTACT.email}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
