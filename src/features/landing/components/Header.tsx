'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, ExternalLink, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/features/auth/api/use-current-user';

// Define module types for the mega menu
interface Module {
  name: string;
  description: string;
  icon: string;
  href: string;
}

// Map feature IDs to tab IDs
const featureToTabMap: Record<string, string> = {
  'messaging': 'communication',
  'canvas': 'communication',
  'tasks': 'taskManagement',
  'boards': 'taskManagement',
  'calendar': 'planning',
  'notes': 'planning',
  'reports': 'analytics',
  'ai': 'analytics',
};

const modules: Module[] = [
  {
    name: 'Messaging',
    description: 'Real-time team communication',
    icon: '💬',
    href: `/features?tab=${featureToTabMap['messaging']}&feature=messaging`,
  },
  {
    name: 'Tasks',
    description: 'Organize and track work',
    icon: '✅',
    href: `/features?tab=${featureToTabMap['tasks']}&feature=tasks`,
  },
  {
    name: 'Calendar',
    description: 'Schedule and manage events',
    icon: '📅',
    href: `/features?tab=${featureToTabMap['calendar']}&feature=calendar`,
  },
  {
    name: 'Boards',
    description: 'Visual project management',
    icon: '📋',
    href: `/features?tab=${featureToTabMap['boards']}&feature=boards`,
  },
  {
    name: 'Canvas',
    description: 'Collaborative whiteboarding',
    icon: '🎨',
    href: `/features?tab=${featureToTabMap['canvas']}&feature=canvas`,
  },
  {
    name: 'Notes',
    description: 'Document and share knowledge',
    icon: '📝',
    href: `/features?tab=${featureToTabMap['notes']}&feature=notes`,
  },
  {
    name: 'Reports',
    description: 'Analytics and insights',
    icon: '📊',
    href: `/features?tab=${featureToTabMap['reports']}&feature=reports`,
  },
  {
    name: 'AI Assistant',
    description: 'Intelligent productivity tools',
    icon: '🤖',
    href: `/features?tab=${featureToTabMap['ai']}&feature=ai`,
  },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled
        ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
        : "bg-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 overflow-hidden">
              <Image
                src="/logo.png"
                alt="Proddy Logo"
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className={cn(
              "text-xl font-bold transition-colors duration-300",
              isScrolled ? "text-gray-900" : "text-gray-800"
            )}>
              Proddy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {/* Features dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsModulesOpen(true)}
              onMouseLeave={() => setIsModulesOpen(false)}
            >
              <Link
                href="/features"
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors duration-200",
                  isScrolled ? "text-gray-700 hover:text-primary" : "text-gray-700 hover:text-primary",
                  isModulesOpen && "text-primary"
                )}
              >
                <span>Features</span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isModulesOpen && "rotate-180"
                )} />
              </Link>

              {/* Mega menu dropdown */}
              <AnimatePresence>
                {isModulesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[600px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="grid grid-cols-2 gap-4 p-6">
                      {modules.map((module) => (
                        <Link
                          key={module.name}
                          href={module.href}
                          className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                        >
                          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md bg-primary/5 text-xl">
                            {module.icon}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{module.name}</p>
                            <p className="mt-1 text-xs text-gray-500">{module.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/why-proddy"
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                isScrolled ? "text-gray-700 hover:text-primary" : "text-gray-700 hover:text-primary"
              )}
            >
              Why Proddy?
            </Link>

            <Link
              href="/pricing"
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                isScrolled ? "text-gray-700 hover:text-primary" : "text-gray-700 hover:text-primary"
              )}
            >
              Pricing/-
            </Link>

            <Link
              href="https://proddy.canny.io/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-sm font-medium transition-colors duration-200 flex items-center gap-1",
                isScrolled ? "text-gray-700 hover:text-primary" : "text-gray-700 hover:text-primary"
              )}
            >
              Roadmap <ExternalLink className="size-3" />
            </Link>

            <Link
              href="https://proddy.freshdesk.com/support/home"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-sm font-medium transition-colors duration-200 flex items-center gap-1",
                isScrolled ? "text-gray-700 hover:text-primary" : "text-gray-700 hover:text-primary"
              )}
            >
              Support <ExternalLink className="size-3" />
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <Link href="/workspace">
                <Button
                  className={cn(
                    "rounded-full transition-all duration-300 flex items-center gap-2",
                    isScrolled
                      ? "bg-primary hover:bg-primary/90 text-white shadow-sm"
                      : "bg-primary hover:bg-primary/90 text-white shadow-md"
                  )}
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signin">
                  <Button
                    variant="outline"
                    className="rounded-full border-gray-300 hover:border-primary/50 hover:text-primary"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className={cn(
                      "rounded-full transition-all duration-300",
                      isScrolled
                        ? "bg-primary hover:bg-primary/90 text-white shadow-sm"
                        : "bg-primary hover:bg-primary/90 text-white shadow-md"
                    )}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="px-5 py-6 space-y-6">
              <div className="space-y-4">
                {/* Features with submenu */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/features"
                      className="block text-base font-medium text-gray-700 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Features
                    </Link>
                  </div>

                  <div className="pl-4 grid grid-cols-2 gap-3">
                    {modules.map((module) => (
                      <Link
                        key={module.name}
                        href={module.href}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="text-lg">{module.icon}</span>
                        <span>{module.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <Link
                  href="/why-proddy"
                  className="block text-base font-medium text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Why Proddy?
                </Link>
                <Link
                  href="/pricing"
                  className="block text-base font-medium text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing/-
                </Link>

                <Link
                  href="https://proddy.canny.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-base font-medium text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Roadmap <ExternalLink className="size-3" />
                </Link>

                <Link
                  href="https://proddy.freshdesk.com/support/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-base font-medium text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Support <ExternalLink className="size-3" />
                </Link>
              </div>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {currentUser ? (
                  <Link href="/workspace" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full rounded-full flex items-center justify-center gap-2">
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full rounded-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
