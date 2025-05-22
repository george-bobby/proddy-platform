"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export const ChatDemoSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900"
        >
          Just Ask. Proddy Knows.
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            {/* Chat Header */}
            <div className="bg-primary text-white p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/20 text-white font-semibold">
                P
              </div>
              <div>
                <div className="font-semibold">Proddy AI</div>
                <div className="text-sm opacity-80">Your Engineering Assistant</div>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="p-6 h-[400px] overflow-y-auto space-y-6">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-primary text-white px-4 py-3 rounded-2xl rounded-tr-sm">
                  <div className="text-sm">How's my day looking?</div>
                </div>
              </div>
              
              {/* AI Message */}
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="text-sm">
                    Good morning! Here's your day ahead:<br /><br />
                    📅 <span className="font-semibold">3 meetings</span> - Sprint planning at 10am (high priority)<br />
                    📧 <span className="font-semibold">12 unread emails</span> - 2 urgent from stakeholders<br />
                    🚨 <span className="font-semibold">1 P1 incident</span> - Database performance issue (assigned to Sarah)<br />
                    📊 <span className="font-semibold">Projects:</span> Payment API (on track), Mobile App (2 days behind)
                  </div>
                </div>
              </div>
              
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-primary text-white px-4 py-3 rounded-2xl rounded-tr-sm">
                  <div className="text-sm">What's the context for the 10am sprint planning?</div>
                </div>
              </div>
              
              {/* AI Message */}
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="text-sm">
                    Sprint Planning - Q2 Feature Development<br /><br />
                    <span className="font-semibold">Agenda:</span><br />
                    • Review completed stories from last sprint<br />
                    • Plan capacity for upcoming sprint<br />
                    • Discuss mobile app delays<br /><br />
                    <span className="font-semibold">Attendees:</span> Your team + Product Manager Lisa<br />
                    <span className="font-semibold">Prep needed:</span> Review velocity metrics and blocker analysis
                  </div>
                </div>
              </div>
              
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-primary text-white px-4 py-3 rounded-2xl rounded-tr-sm">
                  <div className="text-sm">Show me a summary of the #engineering-alerts channel</div>
                </div>
              </div>
              
              {/* Typing Indicator */}
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
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
          </div>
        </motion.div>
      </div>
    </section>
  );
};
