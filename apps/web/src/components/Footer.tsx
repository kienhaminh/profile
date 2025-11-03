import type { JSX } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { INFORMATION, CONTACT } from '@/constants/information';
import { Github, Linkedin, Mail } from 'lucide-react';

export function Footer(): JSX.Element {
  return (
    <footer
      className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden"
      role="contentinfo"
    >
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="footer-section">
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Contact Information
            </h3>
            <div className="space-y-4">
              <Link
                href={`mailto:${CONTACT.email}`}
                className="flex items-center group hover:translate-x-1 transition-transform duration-200"
              >
                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors mr-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {CONTACT.email}
                </span>
              </Link>
              <Link
                href={`tel:${CONTACT.mobile}`}
                className="flex items-center group hover:translate-x-1 transition-transform duration-200"
              >
                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors mr-3">
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {CONTACT.mobile}
                </span>
              </Link>
              <div className="flex items-start group">
                <div className="p-2 rounded-lg bg-white/10 mr-3 mt-0.5">
                  <Mail className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-gray-300">{CONTACT.address}</span>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Connect With Me
            </h3>
            <div className="space-y-4">
              <Link
                href={CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center group hover:translate-x-1 transition-transform duration-200"
              >
                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-blue-600 transition-colors mr-3">
                  <Linkedin className="w-5 h-5" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  LinkedIn
                </span>
              </Link>
              <Link
                href={CONTACT.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center group hover:translate-x-1 transition-transform duration-200"
              >
                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-purple-600 transition-colors mr-3">
                  <Github className="w-5 h-5" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  GitHub
                </span>
              </Link>
              <Link
                href={CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center group hover:translate-x-1 transition-transform duration-200"
              >
                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-blue-500 transition-colors mr-3">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  Facebook
                </span>
              </Link>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <div className="space-y-4">
              <Link
                href="/projects"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                View My Projects
              </Link>
              <Link
                href="/blog"
                className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                Read My Blog
              </Link>
              <Link
                href={`mailto:${CONTACT.email}`}
                className="inline-block mt-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white hover:text-white border-2 border-white/30 bg-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get In Touch
                  <Mail className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {INFORMATION.name}. All rights
              reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Made with</span>
              <span className="text-red-500 animate-pulse">♥</span>
              <span>using Next.js</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
