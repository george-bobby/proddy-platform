"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Calendar, AlertTriangle, BarChart, Mail, MessageSquare, GitPullRequest } from "lucide-react";

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
          Your Morning Command Center
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            {/* Dashboard Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-800">Engineering Dashboard - Thursday, May 22</h3>
            </div>
            
            {/* Dashboard Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Today's Schedule Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-gray-800">Today's Schedule</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Sprint Planning</span>
                      <span className="font-medium text-gray-900">10:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">1:1 with Sarah</span>
                      <span className="font-medium text-gray-900">2:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Architecture Review</span>
                      <span className="font-medium text-gray-900">4:00 PM</span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Critical Alerts Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h4 className="font-semibold text-gray-800">Critical Alerts</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">P1 Incident - DB Performance</span>
                      <span className="font-medium text-red-500">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Deploy Pipeline Failed</span>
                      <span className="font-medium text-amber-500">Investigating</span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Project Status Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-gray-800">Project Status</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Payment API v2</span>
                      <span className="font-medium text-gray-900">On Track</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Mobile App Release</span>
                      <span className="font-medium text-amber-500">2 days behind</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Security Audit</span>
                      <span className="font-medium text-gray-900">Completed</span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Team Updates Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-gray-800">Team Updates</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Urgent emails</span>
                      <span className="font-medium text-amber-500">2 unread</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Slack mentions</span>
                      <span className="font-medium text-gray-900">5 new</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Code reviews pending</span>
                      <span className="font-medium text-gray-900">3 waiting</span>
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
