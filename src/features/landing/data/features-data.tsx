import { MessageSquare, CheckSquare, Calendar, LayoutGrid, PaintBucket, FileText, BarChart, Bot } from 'lucide-react';
import { ReactNode } from 'react';

export interface Feature {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  icon: ReactNode;
  color: string;
  features: string[];
  benefits: string[];
  useCases: string[];
  imageSrc: string;
}

export const featureGroups = [
  {
    title: "Communication & Collaboration",
    description: "Tools that help your team communicate and work together effectively",
    features: ["messaging", "notes", "canvas"]
  },
  {
    title: "Task & Project Management",
    description: "Tools to organize, track, and visualize your team's work",
    features: ["tasks", "boards"]
  },
  {
    title: "Planning & Organization",
    description: "Tools to help your team plan and stay organized",
    features: ["calendar"]
  },
  {
    title: "Analytics & Intelligence",
    description: "Tools that provide insights and intelligent assistance",
    features: ["reports", "ai"]
  }
];

export const features: Feature[] = [
  {
    id: 'messaging',
    name: 'Messaging',
    description: 'Real-time team communication with rich text formatting, threads, and AI-powered features.',
    detailedDescription: 'Proddy Messaging transforms how your team communicates with a powerful, intuitive platform designed for modern collaboration. With rich text formatting, threaded conversations, and AI-powered features, your team can stay connected and productive no matter where they are.',
    icon: <MessageSquare className="size-6" />,
    color: 'bg-blue-500',
    features: [
      'Rich text formatting and emoji reactions',
      'Threaded conversations for organized discussions',
      'AI-powered message summarization',
      'Searchable message history',
      'Direct messaging and group chats',
      'File sharing and previews',
      'Message pinning and bookmarks',
    ],
    benefits: [
      'Reduce email overload by centralizing team communication',
      'Keep conversations organized and easy to follow',
      'Save time with AI-powered summaries of long discussions',
      'Ensure important information is never lost with powerful search',
      'Build team culture with emoji reactions and casual interactions',
    ],
    useCases: [
      'Daily team standups and check-ins',
      'Project-specific discussions and updates',
      'Cross-department collaboration',
      'Remote team communication',
      'Quick decision-making and feedback gathering',
    ],
    imageSrc: '/messages.png',
  },
  {
    id: 'tasks',
    name: 'Tasks',
    description: 'Organize and track work with customizable task lists, assignments, and due dates.',
    detailedDescription: 'Proddy Tasks helps teams stay organized and accountable with a flexible task management system. Create, assign, and track tasks with customizable workflows that adapt to your team\'s unique processes. From simple to-do lists to complex project management, Tasks scales to meet your needs.',
    icon: <CheckSquare className="size-6" />,
    color: 'bg-green-500',
    features: [
      'Task creation and assignment',
      'Due dates and reminders',
      'Priority levels and labels',
      'Progress tracking',
      'Calendar integration',
      'Recurring tasks',
      'Subtasks and dependencies',
      'Custom fields and statuses',
    ],
    benefits: [
      'Keep everyone accountable with clear ownership and deadlines',
      'Never miss important deadlines with automated reminders',
      'Adapt to any workflow with customizable statuses and fields',
      'Track progress at both individual and team levels',
      'Reduce meeting time by providing visibility into task status',
    ],
    useCases: [
      'Sprint planning and agile development',
      'Marketing campaign management',
      'Customer onboarding processes',
      'Product roadmap execution',
      'Personal task management',
    ],
    imageSrc: '/tasks.png',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Schedule and manage events, meetings, and deadlines with team-wide visibility.',
    detailedDescription: 'Proddy Calendar brings clarity to your team\'s schedule with a powerful, collaborative calendar system. Coordinate meetings, track important dates, and manage availability all in one place. With AI-powered scheduling suggestions, finding the perfect meeting time has never been easier.',
    icon: <Calendar className="size-6" />,
    color: 'bg-purple-500',
    features: [
      'Event scheduling and management',
      'Meeting coordination',
      'Availability sharing',
      'Recurring events',
      'Notifications and reminders',
      'Calendar integrations (Google, Outlook)',
      'Meeting agenda templates',
      'AI-powered scheduling suggestions',
    ],
    benefits: [
      'Eliminate scheduling conflicts with team-wide visibility',
      'Reduce back-and-forth emails when scheduling meetings',
      'Keep everyone informed of important dates and deadlines',
      'Integrate with existing calendar systems for seamless adoption',
      'Save time with intelligent scheduling recommendations',
    ],
    useCases: [
      'Team meetings and one-on-ones',
      'Project milestone tracking',
      'Event planning and coordination',
      'Client meeting scheduling',
      'Company-wide announcements and events',
    ],
    imageSrc: '/calender.png',
  },
  {
    id: 'boards',
    name: 'Boards',
    description: 'Visual project management with customizable boards, lists, and cards.',
    detailedDescription: 'Proddy Boards provides a visual approach to project management that helps teams see the big picture. With customizable boards, lists, and cards, you can create workflows that match exactly how your team works. Track progress visually and identify bottlenecks at a glance.',
    icon: <LayoutGrid className="size-6" />,
    color: 'bg-pink-500',
    features: [
      'Kanban, table, and Gantt views',
      'Customizable workflows',
      'Card assignments and due dates',
      'File attachments',
      'Progress tracking',
      'Automated workflows',
      'Integration with Tasks and Calendar',
      'Custom fields and labels',
    ],
    benefits: [
      'Visualize project progress and identify bottlenecks',
      'Adapt boards to match your exact workflow needs',
      'Keep all project-related information in one place',
      'Improve team collaboration with shared visibility',
      'Automate routine tasks to save time',
    ],
    useCases: [
      'Agile development sprints',
      'Editorial calendars',
      'Sales pipeline management',
      'Hiring and recruitment processes',
      'Product development lifecycle',
    ],
    imageSrc: '/boards.png',
  },
  {
    id: 'canvas',
    name: 'Canvas',
    description: 'Collaborative whiteboarding for brainstorming, planning, and visual collaboration.',
    detailedDescription: 'Proddy Canvas is your team\'s digital whiteboard for visual collaboration. Brainstorm ideas, create diagrams, plan projects, and collaborate in real-time with a flexible canvas that adapts to any creative process. With powerful drawing tools and templates, Canvas makes visual thinking accessible to everyone.',
    icon: <PaintBucket className="size-6" />,
    color: 'bg-orange-500',
    features: [
      'Real-time collaborative drawing',
      'Shapes, text, and connectors',
      'Image uploads',
      'Infinite canvas',
      'Presentation mode',
      'Templates for common diagrams',
      'Sticky notes and comments',
      'Export to various formats',
    ],
    benefits: [
      'Facilitate better brainstorming sessions with visual tools',
      'Collaborate in real-time regardless of location',
      'Capture and organize ideas visually',
      'Create professional diagrams without specialized skills',
      'Present ideas directly from your canvas',
    ],
    useCases: [
      'Brainstorming sessions',
      'User journey mapping',
      'System architecture diagrams',
      'Mind mapping',
      'Project planning and roadmapping',
    ],
    imageSrc: '/canvas.png',
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Document and share knowledge with rich text notes, wikis, and documentation.',
    detailedDescription: 'Proddy Notes is your team\'s central knowledge base, making it easy to create, organize, and share information. With powerful rich text editing, version history, and collaborative features, Notes ensures that your team\'s knowledge is always accessible and up-to-date.',
    icon: <FileText className="size-6" />,
    color: 'bg-yellow-500',
    features: [
      'Rich text editing with formatting',
      'Hierarchical organization',
      'Version history',
      'Collaborative editing',
      'AI-powered content suggestions',
      'Templates for common documents',
      'Search and tagging',
      'Embedding of media and files',
    ],
    benefits: [
      'Create a centralized knowledge base for your team',
      'Reduce information silos and duplicate documentation',
      'Ensure everyone has access to the latest information',
      'Track changes with comprehensive version history',
      'Save time with AI-assisted content creation',
    ],
    useCases: [
      'Internal documentation and wikis',
      'Meeting notes and summaries',
      'Project documentation',
      'Onboarding materials',
      'Process documentation',
    ],
    imageSrc: '/notes.png',
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Analytics and insights to track team performance, project progress, and more.',
    detailedDescription: 'Proddy Reports provides powerful analytics and insights that help you understand how your team is performing. With customizable dashboards, detailed metrics, and AI-powered predictions, Reports gives you the data you need to make informed decisions and continuously improve your team\'s effectiveness.',
    icon: <BarChart className="size-6" />,
    color: 'bg-cyan-500',
    features: [
      'Customizable dashboards',
      'Project and team analytics',
      'Time tracking and reporting',
      'Export and sharing options',
      'Predictive analytics with AI',
      'Custom report creation',
      'Automated reporting schedules',
      'Integration with all Proddy modules',
    ],
    benefits: [
      'Gain visibility into team performance and productivity',
      'Identify trends and patterns in your work',
      'Make data-driven decisions about resource allocation',
      'Track progress toward goals and KPIs',
      'Share insights with stakeholders through professional reports',
    ],
    useCases: [
      'Team performance reviews',
      'Project status reporting',
      'Resource utilization analysis',
      'Productivity tracking',
      'Executive dashboards',
    ],
    imageSrc: '/reports.png',
  },
  {
    id: 'ai',
    name: 'AI Assistant',
    description: 'Intelligent assistant that helps with summarization, suggestions, and automation.',
    detailedDescription: 'Proddy AI Assistant is your team\'s intelligent companion, enhancing productivity across all modules. From summarizing long conversations to suggesting responses and automating routine tasks, the AI Assistant learns from your team\'s patterns to provide increasingly valuable assistance over time.',
    icon: <Bot className="size-6" />,
    color: 'bg-indigo-500',
    features: [
      'Message summarization',
      'Smart replies and suggestions',
      'Content generation',
      'Task prioritization',
      'Meeting notes and action items',
      'Predictive analytics',
      'Natural language processing',
      'Personalized recommendations',
    ],
    benefits: [
      'Save time on routine tasks with intelligent automation',
      'Get quick summaries of long discussions and documents',
      'Receive contextual suggestions based on your work patterns',
      'Improve decision-making with AI-powered insights',
      'Continuously learn and adapt to your team\'s unique needs',
    ],
    useCases: [
      'Meeting summarization and follow-up',
      'Email and message drafting',
      'Research assistance',
      'Data analysis and pattern recognition',
      'Personal productivity enhancement',
    ],
    imageSrc: '/assistant.png',
  },
];
