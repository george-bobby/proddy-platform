'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const LandingNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 py-4 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Proddy Logo" width={40} height={40} />
            <span className="text-xl font-bold text-secondary hidden md:inline-block">Proddy</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm font-medium text-gray-600 hover:text-secondary transition-colors">
            Features
          </Link>
          <Link href="/#pricing" className="text-sm font-medium text-gray-600 hover:text-secondary transition-colors">
            Pricing
          </Link>
          <Link href="https://proddy.canny.io/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600 hover:text-secondary transition-colors">
            Roadmap
          </Link>
          <Link href="https://proddy.betteruptime.com/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600 hover:text-secondary transition-colors">
            Status
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="sm">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-secondary hover:bg-gray-100"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden fixed inset-0 z-50 bg-white pt-16 px-4 transition-transform duration-300 ease-in-out transform",
        isMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col gap-6">
          <Link
            href="/#features"
            className="text-lg font-medium text-gray-600 hover:text-secondary transition-colors py-2 border-b border-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="text-lg font-medium text-gray-600 hover:text-secondary transition-colors py-2 border-b border-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="https://proddy.canny.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-medium text-gray-600 hover:text-secondary transition-colors py-2 border-b border-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Roadmap
          </Link>
          <Link
            href="https://proddy.betteruptime.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-medium text-gray-600 hover:text-secondary transition-colors py-2 border-b border-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Status
          </Link>

          <div className="flex flex-col gap-4 mt-4">
            <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
