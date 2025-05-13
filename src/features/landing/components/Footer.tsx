'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Logo and description */}
          <div className="md:col-span-4">
            <Link href="/home" className="flex items-center gap-2 mb-4 group">
              <div className="relative w-8 h-8 overflow-hidden transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/logo.png"
                  alt="Proddy Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">Proddy</span>
            </Link>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              The AI-powered modular productivity suite designed for modern teams.
              Streamline your workflow with integrated tools enhanced by artificial intelligence.
            </p>
            <div className="flex space-x-5">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-all duration-200 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-all duration-200 hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-all duration-200 hover:scale-110"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/home#features" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/home#modules" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Modules
                </Link>
              </li>
              <li>
                <Link href="/home#pricing" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="https://proddy.betteruptime.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Status <ExternalLink className="size-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="https://proddy.canny.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Roadmap <ExternalLink className="size-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources links */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  API
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Subscribe to our newsletter for product updates and news.
            </p>
            <form className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 text-sm rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 text-sm rounded-r-lg hover:bg-primary/90 transition-colors"
                >
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-gray-400">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom section with legal links */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Proddy. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-gray-500 hover:text-primary transition-colors">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="text-sm text-gray-500 hover:text-primary transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
