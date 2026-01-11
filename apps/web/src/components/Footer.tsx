import type { JSX } from 'react';
import Link from 'next/link';
import { INFORMATION } from '@/constants/information';
import { Mail, Linkedin } from 'lucide-react';
import {
  SiGithub,
  SiFacebook,
  SiYoutube,
  SiTiktok,
  SiX,
} from '@icons-pack/react-simple-icons';

/**
 * Footer - Minimal footer following the modern design aesthetic.
 * Clean layout with copyright and social links.
 * Note: LinkedIn icon uses lucide-react as it was removed from simple-icons due to Microsoft licensing.
 */
export function Footer(): JSX.Element {
  const { socialLinks, email, name } = INFORMATION;

  return (
    <footer className="border-t border-border py-12" role="contentinfo">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <Link
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-200"
              aria-label="GitHub"
            >
              <SiGithub className="w-5 h-5" />
            </Link>
            <Link
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-200"
              aria-label="Facebook"
            >
              <SiFacebook className="w-5 h-5" />
            </Link>
            {socialLinks.youtube && (
              <Link
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-200"
                aria-label="YouTube"
              >
                <SiYoutube className="w-5 h-5" />
              </Link>
            )}
            {socialLinks.tiktok && (
              <Link
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-200"
                aria-label="TikTok"
              >
                <SiTiktok className="w-5 h-5" />
              </Link>
            )}
            {socialLinks.x && (
              <Link
                href={socialLinks.x}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-200"
                aria-label="X"
              >
                <SiX className="w-5 h-5" />
              </Link>
            )}
            <Link
              href={`mailto:${email}`}
              className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-200"
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
