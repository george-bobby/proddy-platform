import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle, MessageSquare, Users, Calendar, BarChart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LandingNavbar } from '@/components/landing-navbar';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
            Team Collaboration <span className="text-primary">Reimagined</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-[800px]">
            A vibrant team collaboration platform with real-time messaging, rich text editing, and everything your team needs to stay productive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/auth">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/#features">
              <Button size="lg" variant="outline">
                Explore Features
              </Button>
            </Link>
          </div>
          <div className="relative w-full max-w-5xl rounded-lg shadow-xl overflow-hidden">
            <Image
              src="/dashboard-preview.svg"
              alt="Proddy Dashboard Preview"
              width={1200}
              height={675}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
              Everything Your Team Needs
            </h2>
            <p className="text-lg text-gray-600 max-w-[800px] mx-auto">
              Proddy combines the best tools for messaging, task management, and collaboration in one seamless platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-start p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2 rounded-full bg-primary/10 mb-4">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Messaging</h3>
              <p className="text-gray-600 mb-4">
                Communicate with your team instantly with rich text formatting, emoji support, and threaded conversations.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-500" />
                  <span className="text-sm">Thread support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-500" />
                  <span className="text-sm">Rich text editor</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-500" />
                  <span className="text-sm">Emoji reactions</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-start p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2 rounded-full bg-secondary/10 mb-4">
                <Users className="size-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Team Workspaces</h3>
              <p className="text-gray-600 mb-4">
                Create dedicated spaces for different teams or projects with customizable channels and permissions.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-500" />
                  <span className="text-sm">Multiple workspaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-500" />
                  <span className="text-sm">Custom channels</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-500" />
                  <span className="text-sm">Role-based permissions</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-start p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2 rounded-full bg-tertiary/10 mb-4">
                <Calendar className="size-6 text-tertiary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Calendar & Tasks</h3>
              <p className="text-gray-600 mb-4">
                Keep track of deadlines and manage tasks with integrated calendar and task management tools.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-500" />
                  <span className="text-sm">Task assignments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-500" />
                  <span className="text-sm">Calendar integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-500" />
                  <span className="text-sm">Deadline reminders</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-primary text-white">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to transform how your team works?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-[600px] mx-auto">
            Join thousands of teams already using Proddy to collaborate more effectively.
          </p>
          <Link href="/auth">
            <Button size="lg" variant="glass" className="gap-2">
              Get Started for Free <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 bg-gray-100">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Image src="/logo.svg" alt="Proddy Logo" width={30} height={30} />
              <span className="text-lg font-bold text-gray-900">Proddy</span>
            </div>
            <div className="flex flex-wrap gap-4 md:gap-8 justify-center">
              <Link href="/#features" className="text-sm text-gray-600 hover:text-primary">
                Features
              </Link>
              <Link href="/#pricing" className="text-sm text-gray-600 hover:text-primary">
                Pricing
              </Link>
              <Link href="https://proddy.canny.io/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-primary">
                Roadmap
              </Link>
              <Link href="https://proddy.betteruptime.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-primary">
                Status
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Proddy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
