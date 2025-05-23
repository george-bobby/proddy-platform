"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  Bell,
  FileText,
  Kanban,
  PenTool,
  Users
} from "lucide-react";

export const DashboardPreviewSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900"
        >
          Your Team's Command Center
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-gray-600 max-w-3xl mx-auto mb-10 text-lg"
        >
          Proddy brings all your team's work into one place with customizable widgets for tasks, events, boards, and more.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            {/* Dashboard Header */}
            <div className="bg-primary/10 border-b border-primary/20 p-6">
              <h3 className="text-xl font-semibold text-gray-800">Proddy Dashboard - Marketing Team</h3>
            </div>

            {/* Dashboard Content */}
            <div className="p-6">
              {/* Full-width Notes Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-gray-800">Recent Notes</h4>
                  </div>
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">Collaborative</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <h5 className="font-medium text-gray-800 mb-1">Q3 Marketing Strategy</h5>
                    <p className="text-xs text-gray-500 mb-2">Updated 2 days ago</p>
                    <p className="text-sm text-gray-600 line-clamp-2">Our focus for Q3 will be expanding our social media presence and launching the new...</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <h5 className="font-medium text-gray-800 mb-1">Product Roadmap</h5>
                    <p className="text-xs text-gray-500 mb-2">Updated yesterday</p>
                    <p className="text-sm text-gray-600 line-clamp-2">Key features planned for next release include improved dashboard customization and...</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <h5 className="font-medium text-gray-800 mb-1">Team Meeting Notes</h5>
                    <p className="text-xs text-gray-500 mb-2">Updated today</p>
                    <p className="text-sm text-gray-600 line-clamp-2">Action items: Alex to finalize content calendar, Jamie to review analytics report...</p>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calendar Events Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-gray-800">Today's Events</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Weekly Team Sync</span>
                      <span className="font-medium text-gray-900">10:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Content Review</span>
                      <span className="font-medium text-gray-900">1:30 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Campaign Planning</span>
                      <span className="font-medium text-gray-900">3:00 PM</span>
                    </div>
                  </div>
                </motion.div>

                {/* Tasks Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-gray-800">My Tasks</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Finalize Q3 Strategy</span>
                      <span className="font-medium text-amber-500">Due Today</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Review Blog Post</span>
                      <span className="font-medium text-primary">In Progress</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Social Media Calendar</span>
                      <span className="font-medium text-green-500">Completed</span>
                    </div>
                  </div>
                </motion.div>

                {/* Board Status Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Kanban className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-gray-800">Board Status</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Website Redesign</span>
                      <span className="font-medium text-gray-900">On Track</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Product Launch</span>
                      <span className="font-medium text-primary">In Review</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Customer Interviews</span>
                      <span className="font-medium text-green-500">Completed</span>
                    </div>
                  </div>
                </motion.div>

                {/* Team Activity Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-gray-800">Recent Activity</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">@alex mentioned you</span>
                      <span className="font-medium text-primary">5m ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">New note shared</span>
                      <span className="font-medium text-gray-900">30m ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Canvas updated</span>
                      <span className="font-medium text-gray-900">1h ago</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
