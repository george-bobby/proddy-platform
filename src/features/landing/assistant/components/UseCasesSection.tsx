'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bot, CheckSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const UseCasesSection = () => {
  const useCasesRef = useRef<HTMLDivElement>(null);
  const isUseCasesInView = useInView(useCasesRef, { once: true, margin: "-100px 0px" });

  return (
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
  );
};
