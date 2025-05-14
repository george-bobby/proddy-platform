'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10 justify-between">
          {/* Logo and description */}
          <div className="md:col-span-1">
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
            <p className="text-sm text-gray-500 mb-6">
              Made with ❤️ in Bengaluru, India
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
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-500 hover:text-primary transition-colors">
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
          <div className="md:col-span-1">
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
                <Link href="/solutions" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Solutions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://proddy.freshdesk.com/support/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Help Center <ExternalLink className="size-3" />
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@proddy.freshdesk.com"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Email Support
                </a>
              </li>
            </ul>
          </div>

          {/* Resources links */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
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
              <li>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="https://proddy.freshdesk.com/support/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Support Portal <ExternalLink className="size-3" />
                </a>
              </li>
            </ul>
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
              <a
                href="https://proddy.freshdesk.com/support/home"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                Support <ExternalLink className="size-3" />
              </a>
              <a
                href="mailto:support@proddy.freshdesk.com"
                className="text-sm text-gray-500 hover:text-primary transition-colors"
              >
                support@proddy.freshdesk.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
