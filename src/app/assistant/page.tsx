'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Bot,
  ArrowRight,
  Search,
  MessageSquare,
  Calendar,
  CheckSquare,
  FileText,
  Sparkles,
  Brain,
  Zap,
  Lock,
  Send
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Header } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';
import { CTASection } from '@/features/landing/components/CTASection';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AssistantPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const useCasesRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const isHeroInView = useInView(heroRef, { once: true, margin: "-100px 0px" });
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px 0px" });
  const isDemoInView = useInView(demoRef, { once: true, margin: "-100px 0px" });
  const isUseCasesInView = useInView(useCasesRef, { once: true, margin: "-100px 0px" });
  const isFaqInView = useInView(faqRef, { once: true, margin: "-100px 0px" });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative w-full pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-gray-50"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="container px-6 md:px-8 mx-auto relative z-10 max-w-6xl">
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4"
            >
              <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                AI-Powered Workspace Assistant
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4 max-w-4xl"
            >
              Meet Proddy AI, Your Team's{" "}
              <span className="text-primary relative">
                Intelligent Assistant
                <span className="absolute bottom-1 left-0 w-full h-3 bg-secondary/20 -z-10 rounded-full"></span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl"
            >
              Proddy AI understands your workspace context, helping your team find information,
              summarize content, and get answers to questions without leaving the platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gap-2 rounded-full text-white bg-primary hover:bg-primary/90 px-6 py-2 shadow-md"
                >
                  Try Proddy AI <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-full bg-white border-slate-300 text-slate-700 hover:bg-slate-100 px-6 py-2"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 relative w-full max-w-5xl mx-auto"
          >
            <div className="rounded-2xl overflow-hidden shadow-xl bg-white p-2">
              <div className="relative rounded-xl overflow-hidden">
                <Image
                  src="/dashboard-preview.svg"
                  alt="Proddy AI Assistant Preview"
                  width={1200}
                  height={675}
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-50"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef}
        className="py-20 bg-white"
      >
        <div className="container px-6 md:px-8 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Key Features of Proddy AI
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              Designed to enhance your team's productivity with contextual intelligence
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Search className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Contextual Search</h3>
              <p className="text-gray-600 mb-4">
                Instantly find information across your workspace with natural language queries that understand your team's context.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span className="text-sm text-gray-600">Searches across messages, tasks, notes, and more</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span className="text-sm text-gray-600">Understands natural language questions</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span className="text-sm text-gray-600">Provides source references for all answers</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Calendar className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Schedule Intelligence</h3>
              <p className="text-gray-600 mb-4">
                Get quick insights about your meetings, events, and deadlines without digging through calendars.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span className="text-sm text-gray-600">Summarizes today's meetings and events</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span className="text-sm text-gray-600">Provides upcoming deadline reminders</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span className="text-sm text-gray-600">Helps coordinate team availability</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Brain className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Workspace Memory</h3>
              <p className="text-gray-600 mb-4">
                Proddy AI remembers your team's context and previous interactions to provide more relevant assistance.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span className="text-sm text-gray-600">Learns from team interactions over time</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span className="text-sm text-gray-600">Maintains conversation context</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-primary">•</div>
                  <span className="text-sm text-gray-600">Provides increasingly personalized responses</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section
        ref={demoRef}
        className="py-20 bg-gray-50"
      >
        <div className="container px-6 md:px-8 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isDemoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                Dashboard Integration
              </Badge>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">
                Your AI Assistant, Right in Your Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Proddy AI lives in your team's dashboard, making it instantly accessible whenever you need assistance.
                No need to switch contexts or open new tools – just ask your question and get immediate answers.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Instant Answers</h4>
                    <p className="text-gray-600">
                      Get immediate responses to your questions about workspace content, schedules, and team activities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Privacy-Focused</h4>
                    <p className="text-gray-600">
                      Your workspace data stays private. Proddy AI only accesses the information it needs to answer your specific questions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Conversational Interface</h4>
                    <p className="text-gray-600">
                      Chat naturally with Proddy AI just like you would with a team member. No special commands or syntax required.
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/signup">
                <Button className="gap-2 rounded-full text-white bg-primary hover:bg-primary/90 px-6 py-2 shadow-md">
                  Try It Now <ArrowRight className="size-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isDemoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-4 bg-primary/10 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-gray-800">Proddy AI</h3>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary/10 text-gray-800 rounded-lg rounded-tr-none p-3 max-w-[80%]">
                      <p>What meetings do I have scheduled for today?</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex">
                    <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                      <p className="font-medium mb-2">Here are your meetings for today:</p>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <span className="font-medium">10:00 AM</span> - Weekly Team Sync (Marketing Team)
                        </li>
                        <li>
                          <span className="font-medium">1:30 PM</span> - Content Review with Alex and Jamie
                        </li>
                        <li>
                          <span className="font-medium">3:00 PM</span> - Q3 Campaign Planning
                        </li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">Sources: Calendar Events</p>
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary/10 text-gray-800 rounded-lg rounded-tr-none p-3 max-w-[80%]">
                      <p>Can you summarize the notes from our last marketing meeting?</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex">
                    <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                      <p className="font-medium mb-2">Here's a summary of the last marketing meeting notes:</p>
                      <p className="text-sm mb-2">
                        The team discussed the Q3 social media strategy, focusing on increasing engagement across LinkedIn and Twitter. Key decisions:
                      </p>
                      <ul className="space-y-1 text-sm list-disc pl-4">
                        <li>Increase posting frequency to 3x per week</li>
                        <li>Create a content calendar by Friday (assigned to Jamie)</li>
                        <li>Allocate $2,000 budget for promoted posts</li>
                        <li>Schedule a follow-up meeting next Tuesday</li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">Sources: Notes "Marketing Strategy Q3"</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask a question about your workspace..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      disabled
                    />
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section
        ref={useCasesRef}
        className="py-20 bg-white"
      >
        <div className="container px-6 md:px-8 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isUseCasesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              How Teams Use Proddy AI
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isUseCasesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              Real-world applications that boost productivity across different team functions
            </motion.p>
          </div>

          <Tabs defaultValue="marketing" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="product">Product</TabsTrigger>
              <TabsTrigger value="engineering">Engineering</TabsTrigger>
              <TabsTrigger value="leadership">Leadership</TabsTrigger>
            </TabsList>

            <TabsContent value="marketing" className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isUseCasesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Marketing Teams</h3>
                  <p className="text-gray-600 mb-6">
                    Marketing teams use Proddy AI to streamline campaign planning, content creation, and performance tracking.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                        <CheckSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800 font-medium">Campaign Coordination</p>
                        <p className="text-gray-600 text-sm">
                          "What's the status of our Q3 social media campaign?" gets you instant updates on progress, deadlines, and assigned tasks.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                        <CheckSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800 font-medium">Content Research</p>
                        <p className="text-gray-600 text-sm">
                          "Find all our blog posts about product features" instantly retrieves relevant content from your workspace.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                        <CheckSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800 font-medium">Meeting Summaries</p>
                        <p className="text-gray-600 text-sm">
                          "Summarize yesterday's marketing strategy meeting" provides key points and action items at a glance.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="h-5 w-5 text-primary" />
                      <p className="font-medium text-gray-800">Example Conversation</p>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-primary/10 text-gray-800 rounded-lg p-3 text-sm">
                        <p>What's our content calendar for next week?</p>
                      </div>
                      <div className="bg-gray-100 text-gray-800 rounded-lg p-3 text-sm">
                        <p className="mb-2">Here's your content calendar for next week:</p>
                        <ul className="space-y-1 pl-4 list-disc">
                          <li><strong>Monday:</strong> Blog post on "10 Productivity Tips" (Writer: Jamie)</li>
                          <li><strong>Wednesday:</strong> Product feature announcement for Canvas tool</li>
                          <li><strong>Thursday:</strong> Customer success story with Acme Corp</li>
                          <li><strong>Friday:</strong> Weekly newsletter and social media recap</li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-2">Sources: Marketing Calendar, Content Plan Q3</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="product" className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isUseCasesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Product Teams</h3>
                  <p className="text-gray-600 mb-6">
                    Product teams leverage Proddy AI to track feature development, manage roadmaps, and coordinate cross-functional work.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                        <CheckSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800 font-medium">Feature Tracking</p>
                        <p className="text-gray-600 text-sm">
                          "What's the status of the new dashboard feature?" provides current progress, blockers, and timeline.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                        <CheckSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800 font-medium">Requirement Lookup</p>
                        <p className="text-gray-600 text-sm">
                          "Find the requirements for the mobile app redesign" instantly retrieves relevant documentation.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                        <CheckSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800 font-medium">Sprint Planning</p>
                        <p className="text-gray-600 text-sm">
                          "What tasks are scheduled for our next sprint?" gives you a quick overview of upcoming work.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="h-5 w-5 text-primary" />
                      <p className="font-medium text-gray-800">Example Conversation</p>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-primary/10 text-gray-800 rounded-lg p-3 text-sm">
                        <p>When is the Canvas feature scheduled for release?</p>
                      </div>
                      <div className="bg-gray-100 text-gray-800 rounded-lg p-3 text-sm">
                        <p>The Canvas feature is scheduled for release on October 15th. According to the product roadmap, it's currently in the final testing phase with 85% of tasks completed. The engineering team has reported no critical blockers, and the design team signed off on the UI last week.</p>
                        <p className="text-xs text-gray-500 mt-2">Sources: Product Roadmap, Engineering Sprint Board</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="engineering" className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isUseCasesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Engineering Teams</h3>
                  <p className="text-gray-600 mb-6">
                    Engineering teams use Proddy AI to track development progress, manage sprints, and coordinate technical documentation.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                        <CheckSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800 font-medium">Sprint Management</p>
                        <p className="text-gray-600 text-sm">
                          "What tasks are still open in our current sprint?" gives you immediate visibility into remaining work.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                        <CheckSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800 font-medium">Documentation Access</p>
                        <p className="text-gray-600 text-sm">
                          "Find the API documentation for the user service" instantly retrieves relevant technical docs.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                        <CheckSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800 font-medium">Meeting Coordination</p>
                        <p className="text-gray-600 text-sm">
                          "When is our next code review scheduled?" provides immediate calendar information.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="h-5 w-5 text-primary" />
                      <p className="font-medium text-gray-800">Example Conversation</p>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-primary/10 text-gray-800 rounded-lg p-3 text-sm">
                        <p>What are the open bugs for the messaging feature?</p>
                      </div>
                      <div className="bg-gray-100 text-gray-800 rounded-lg p-3 text-sm">
                        <p className="mb-2">Here are the open bugs for the messaging feature:</p>
                        <ul className="space-y-1 pl-4 list-disc">
                          <li><strong>BUG-423:</strong> Message notifications not appearing on mobile (Priority: High)</li>
                          <li><strong>BUG-427:</strong> Emoji reactions sometimes fail to save (Priority: Medium)</li>
                          <li><strong>BUG-430:</strong> Long messages cause layout issues in thread view (Priority: Low)</li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-2">Sources: Engineering Board, Bug Tracker</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="leadership" className="mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isUseCasesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Leadership Teams</h3>
                  <p className="text-gray-600 mb-6">
                    Leadership teams rely on Proddy AI for high-level insights, cross-team coordination, and strategic planning.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                        <CheckSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800 font-medium">Project Status</p>
                        <p className="text-gray-600 text-sm">
                          "What's the status of our Q3 initiatives?" provides a high-level overview across all teams.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                        <CheckSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800 font-medium">Meeting Preparation</p>
                        <p className="text-gray-600 text-sm">
                          "Summarize the key points from last week's leadership meeting" helps with quick follow-ups.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 mt-1 bg-primary/10 p-1 rounded-full">
                        <CheckSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-800 font-medium">Strategic Planning</p>
                        <p className="text-gray-600 text-sm">
                          "Find all documents related to our 2024 strategy" instantly retrieves relevant materials.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="h-5 w-5 text-primary" />
                      <p className="font-medium text-gray-800">Example Conversation</p>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-primary/10 text-gray-800 rounded-lg p-3 text-sm">
                        <p>Give me a status update on our key Q3 initiatives</p>
                      </div>
                      <div className="bg-gray-100 text-gray-800 rounded-lg p-3 text-sm">
                        <p className="mb-2">Here's the current status of your key Q3 initiatives:</p>
                        <ul className="space-y-2 pl-4 list-disc">
                          <li>
                            <strong>Product Launch (Canvas Feature):</strong> 85% complete, on track for Oct 15 release
                          </li>
                          <li>
                            <strong>Marketing Campaign:</strong> 70% complete, content creation phase, on schedule
                          </li>
                          <li>
                            <strong>Customer Success Program:</strong> 50% complete, training materials delayed by 1 week
                          </li>
                          <li>
                            <strong>Engineering Infrastructure:</strong> 90% complete, ahead of schedule
                          </li>
                        </ul>
                        <p className="text-xs text-gray-500 mt-2">Sources: Strategic Planning, Team Updates, Project Boards</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        ref={faqRef}
        className="py-20 bg-gray-50"
      >
        <div className="container px-6 md:px-8 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isFaqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isFaqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              Common questions about Proddy AI and how it works
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isFaqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">How does Proddy AI access my workspace data?</h3>
                <p className="text-gray-600">
                  Proddy AI only accesses the data within your workspace that it needs to answer your specific questions. It uses a secure retrieval system that maintains privacy and doesn't store or use your data for training purposes.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Is my conversation with Proddy AI private?</h3>
                <p className="text-gray-600">
                  Yes, your conversations with Proddy AI are private to your workspace. Only members of your workspace can see the chat history, and you can clear your conversation history at any time.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Can Proddy AI create content for me?</h3>
                <p className="text-gray-600">
                  While Proddy AI is primarily designed to retrieve and summarize information from your workspace, it can help with basic content creation tasks like drafting messages, summarizing meetings, and organizing information.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isFaqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">What types of questions can I ask Proddy AI?</h3>
                <p className="text-gray-600">
                  You can ask Proddy AI about anything in your workspace: meeting schedules, project statuses, document contents, team updates, task assignments, and more. It works best with specific questions about your workspace content.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Does Proddy AI learn from my team's usage?</h3>
                <p className="text-gray-600">
                  Proddy AI maintains conversation context to provide more relevant responses, but it doesn't currently learn from your team's usage patterns over time. Each interaction is based on the current state of your workspace data.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Is Proddy AI included in all plans?</h3>
                <p className="text-gray-600">
                  Yes, Proddy AI is included in all plans during our beta period. In the future, some advanced AI features may be limited to paid plans, but we'll always provide a useful AI assistant experience for all users.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />

      <Footer />
    </div>
  );
};

export default AssistantPage;
