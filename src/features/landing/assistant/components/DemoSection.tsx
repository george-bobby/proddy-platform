'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Bot, ArrowRight, Zap, Lock, MessageSquare, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const DemoSection = () => {
  const demoRef = useRef<HTMLDivElement>(null);
  const isDemoInView = useInView(demoRef, { once: true, margin: "-100px 0px" });

  return (
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
              <div className="p-6 space-y-6 h-[400px] overflow-y-auto">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-primary/10 text-gray-800 rounded-lg rounded-tr-none p-3 max-w-[80%]">
                    <p>How's my day looking?</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex">
                  <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                    <p className="text-sm">
                      Good morning! Here's your day ahead:<br /><br />
                      📅 <span className="font-semibold">3 meetings</span> - Sprint planning at 10am (high priority)<br />
                      📧 <span className="font-semibold">12 unread emails</span> - 2 urgent from stakeholders<br />
                      🚨 <span className="font-semibold">1 P1 incident</span> - Database performance issue (assigned to Sarah)<br />
                      📊 <span className="font-semibold">Projects:</span> Payment API (on track), Mobile App (2 days behind)
                    </p>
                  </div>
                </div>

                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-primary/10 text-gray-800 rounded-lg rounded-tr-none p-3 max-w-[80%]">
                    <p>What's the context for the 10am sprint planning?</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex">
                  <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                    <p className="text-sm">
                      Sprint Planning - Q2 Feature Development<br /><br />
                      <span className="font-semibold">Agenda:</span><br />
                      • Review completed stories from last sprint<br />
                      • Plan capacity for upcoming sprint<br />
                      • Discuss mobile app delays<br /><br />
                      <span className="font-semibold">Attendees:</span> Your team + Product Manager Lisa<br />
                      <span className="font-semibold">Prep needed:</span> Review velocity metrics and blocker analysis
                    </p>
                  </div>
                </div>

                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-primary/10 text-gray-800 rounded-lg rounded-tr-none p-3 max-w-[80%]">
                    <p>Show me a summary of the #engineering-alerts channel</p>
                  </div>
                </div>

                {/* Typing Indicator */}
                <div className="flex">
                  <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
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
  );
};
