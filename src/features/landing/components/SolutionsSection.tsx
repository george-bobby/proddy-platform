'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, MessageSquare, CheckSquare, Calendar, LayoutGrid, PaintBucket, FileText, BarChart, Bot } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Solution {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

export const SolutionsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  const [activeTab, setActiveTab] = useState('messaging');

  const solutions: Solution[] = [
    {
      id: 'messaging',
      name: 'Messaging',
      description: 'Real-time team communication with rich text formatting, threads, and AI-powered features.',
      icon: <MessageSquare className="size-6" />,
      color: 'bg-blue-500',
      features: [
        'Rich text formatting and emoji reactions',
        'Threaded conversations for organized discussions',
        'AI-powered message summarization',
        'Searchable message history',
        'Direct messaging and group chats',
      ],
    },
    {
      id: 'tasks',
      name: 'Tasks',
      description: 'Organize and track work with customizable task lists, assignments, and due dates.',
      icon: <CheckSquare className="size-6" />,
      color: 'bg-green-500',
      features: [
        'Task assignments and due dates',
        'Custom task statuses and priorities',
        'Subtasks and dependencies',
        'Progress tracking and reporting',
        'AI-suggested task organization',
      ],
    },
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'Schedule and manage events with team availability, reminders, and smart scheduling.',
      icon: <Calendar className="size-6" />,
      color: 'bg-purple-500',
      features: [
        'Team availability view',
        'Meeting scheduling and reminders',
        'Calendar integrations',
        'Recurring events',
        'AI-powered optimal meeting time suggestions',
      ],
    },
    {
      id: 'boards',
      name: 'Boards',
      description: 'Visual project management with customizable boards, cards, and workflows.',
      icon: <LayoutGrid className="size-6" />,
      color: 'bg-orange-500',
      features: [
        'Kanban, list, and calendar views',
        'Custom fields and labels',
        'Drag-and-drop interface',
        'Automated workflows',
        'Progress and burndown charts',
      ],
    },
    {
      id: 'canvas',
      name: 'Canvas',
      description: 'Collaborative whiteboarding for brainstorming, diagramming, and visual collaboration.',
      icon: <PaintBucket className="size-6" />,
      color: 'bg-pink-500',
      features: [
        'Real-time collaborative editing',
        'Templates for common diagrams',
        'Drawing tools and shapes',
        'Image and document embedding',
        'Presentation mode',
      ],
    },
    {
      id: 'notes',
      name: 'Notes',
      description: 'Document and share knowledge with rich text notes, wikis, and documentation.',
      icon: <FileText className="size-6" />,
      color: 'bg-yellow-500',
      features: [
        'Rich text editing with formatting',
        'Hierarchical organization',
        'Version history',
        'Collaborative editing',
        'AI-powered content suggestions',
      ],
    },
    {
      id: 'reports',
      name: 'Reports',
      description: 'Analytics and insights to track team performance, project progress, and more.',
      icon: <BarChart className="size-6" />,
      color: 'bg-cyan-500',
      features: [
        'Customizable dashboards',
        'Project and team analytics',
        'Time tracking and reporting',
        'Export and sharing options',
        'Predictive analytics with AI',
      ],
    },
    {
      id: 'ai',
      name: 'AI Assistant',
      description: 'Intelligent productivity tools that help you work smarter and faster.',
      icon: <Bot className="size-6" />,
      color: 'bg-indigo-500',
      features: [
        'Smart content generation',
        'Automated summarization',
        'Contextual suggestions',
        'Natural language processing',
        'Workflow automation',
      ],
    },
  ];

  const activeSolution = solutions.find(s => s.id === activeTab) || solutions[0];

  return (
    <section id="modules" className="py-20 md:py-32 bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[20%] -left-[5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-4"
          >
            MODULAR PLATFORM
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4"
          >
            Powerful <span className="text-primary">Modules</span> for Every Need
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-[800px] mx-auto"
          >
            Proddy's modular design lets you use exactly what you need. Each module works perfectly on its own or as part of the integrated ecosystem.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1 bg-white rounded-2xl shadow-md p-6"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-900">Modules</h3>
            <div className="space-y-2">
              {solutions.map((solution) => (
                <button
                  key={solution.id}
                  onClick={() => setActiveTab(solution.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                    activeTab === solution.id
                      ? "bg-primary/5 text-primary"
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg text-white",
                    solution.color
                  )}>
                    {solution.icon}
                  </div>
                  <span className="font-medium">{solution.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-md overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8">
                <div className={cn(
                  "p-3 rounded-xl text-white w-fit mb-4",
                  activeSolution.color
                )}>
                  {activeSolution.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{activeSolution.name}</h3>
                <p className="text-gray-600 mb-6">{activeSolution.description}</p>

                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Key Features</h4>
                <ul className="space-y-3 mb-6">
                  {activeSolution.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowRight className="size-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signin">
                  <Button className="gap-2">
                    Try {activeSolution.name} <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
              <div className="relative h-[300px] md:h-auto bg-gray-100">
                <Image
                  src="/dashboard-preview.svg"
                  alt={`${activeSolution.name} module preview`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
